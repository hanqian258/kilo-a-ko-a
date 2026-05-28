// pdf-parse v1 is a simple async function — no worker, no class, no pdfjs setup.
// import() is used because pdf-parse v1 is CommonJS and this file is ESM.
import { createRequire } from 'module';
import { getAdminServices, handleFunctionError, json, requireUser } from './_firebaseAdmin.mjs';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed.' });
  }

  try {
    const user = await requireUser(event);
    const { materialId, storagePath } = JSON.parse(event.body || '{}');

    if (!materialId || !storagePath) {
      return json(400, { error: 'materialId and storagePath are required.' });
    }

    const { db, bucket } = getAdminServices();
    const materialRef = db.collection('materials').doc(materialId);
    const materialSnap = await materialRef.get();

    if (!materialSnap.exists) {
      return json(404, { error: 'Material not found.' });
    }

    const material = materialSnap.data();
    const isReviewer = user.role === 'ADMIN' || user.role === 'SCIENTIST';
    if (!isReviewer && material.authorId !== user.uid) {
      return json(403, { error: 'You can only parse your own submitted materials.' });
    }

    await materialRef.set({ parseStatus: 'pending', parseError: null }, { merge: true });

    const [buffer] = await bucket.file(storagePath).download();
    const data = await pdfParse(buffer);
    const parsedText = (data.text || '').replace(/\s+/g, ' ').trim();
    const previewText = parsedText.slice(0, 700);

    await materialRef.set({
      parsedText,
      previewText,
      parseStatus: 'complete',
      parseError: null,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    return json(200, {
      ok: true,
      characters: parsedText.length,
    });
  } catch (error) {
    try {
      const { materialId } = JSON.parse(event.body || '{}');
      if (materialId) {
        const { db } = getAdminServices();
        await db.collection('materials').doc(materialId).set({
          parseStatus: 'failed',
          parseError: error.message || 'PDF parsing failed.',
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }
    } catch (nestedError) {
      console.error('Failed to persist parse failure:', nestedError);
    }

    return handleFunctionError(error);
  }
};
