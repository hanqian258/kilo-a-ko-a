import { Resend } from 'resend';
import { getAdminServices, handleFunctionError, json, requireReviewer } from './_firebaseAdmin.mjs';

const chunk = (items, size) => {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed.' });
  }

  try {
    const sender = await requireReviewer(event);
    const { subject, message, materialIds = [] } = JSON.parse(event.body || '{}');

    if (!subject || !message) {
      return json(400, { error: 'subject and message are required.' });
    }

    if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
      return json(500, { error: 'Resend environment variables are not configured.' });
    }

    const { db } = getAdminServices();
    const subscribersSnap = await db.collection('subscribers').get();
    const recipients = Array.from(new Set(
      subscribersSnap.docs
        .map((docSnap) => docSnap.data())
        .filter((subscriber) => subscriber.email && !subscriber.unsubscribedAt)
        .map((subscriber) => subscriber.email)
    ));

    const materialRefs = await Promise.all(
      materialIds.map(async (id) => {
        const snap = await db.collection('materials').doc(id).get();
        return snap.exists ? { id: snap.id, ...snap.data() } : null;
      })
    );
    const materials = materialRefs.filter(Boolean);

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <h1 style="color:#0f766e;">${escapeHtml(subject)}</h1>
        <p>${escapeHtml(message).replace(/\n/g, '<br />')}</p>
        ${materials.length ? `
          <h2>Featured materials</h2>
          <ul>
            ${materials.map((material) => `
              <li>
                <strong>${escapeHtml(material.title)}</strong>
                <span>(${escapeHtml(material.gradeBand)} • ${escapeHtml(material.type)})</span>
                <br />
                ${escapeHtml(material.summary || '')}
              </li>
            `).join('')}
          </ul>
        ` : ''}
        <p style="font-size:12px;color:#64748b;">You are receiving this because you subscribed to Kilo a Ko'a updates.</p>
      </div>
    `;

    const campaignRef = db.collection('digestCampaigns').doc();

    if (recipients.length === 0) {
      await campaignRef.set({
        subject,
        message,
        materialIds,
        sentAt: new Date().toISOString(),
        sentBy: sender.uid,
        recipientCount: 0,
        status: 'sent',
      });
      return json(200, { campaignId: campaignRef.id, recipientCount: 0 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    for (const batch of chunk(recipients, 50)) {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
        to: batch,
        subject,
        html,
      });
    }

    await campaignRef.set({
      subject,
      message,
      materialIds,
      sentAt: new Date().toISOString(),
      sentBy: sender.uid,
      recipientCount: recipients.length,
      status: 'sent',
    });

    return json(200, {
      campaignId: campaignRef.id,
      recipientCount: recipients.length,
    });
  } catch (error) {
    try {
      const { subject = '', message = '', materialIds = [] } = JSON.parse(event.body || '{}');
      const { db } = getAdminServices();
      await db.collection('digestCampaigns').add({
        subject,
        message,
        materialIds,
        sentAt: new Date().toISOString(),
        sentBy: 'unknown',
        recipientCount: 0,
        status: 'failed',
        error: error.message || 'Digest failed.',
      });
    } catch (nestedError) {
      console.error('Failed to persist digest failure:', nestedError);
    }

    return handleFunctionError(error);
  }
};
