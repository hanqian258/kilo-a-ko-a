import { getAdminServices, handleFunctionError, json, requireUser } from './_firebaseAdmin.mjs';

export const handler = async (event) => {
  console.log('[parse-material-pdf] handler invoked, method:', event.httpMethod);

  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed.' });
  }

  // Load pdf-parse inside the handler so any import failure returns a 500
  // (with a real error message) instead of a 502 Lambda crash.
  let pdfParse;
  try {
    // Dynamic import works for CJS modules in Node ESM without createRequire.
    const mod = await import('pdf-parse');
    pdfParse = mod.default ?? mod;
    console.log('[parse-material-pdf] pdf-parse loaded, type:', typeof pdfParse);
  } catch (importError) {
    console.error('[parse-material-pdf] Failed to load pdf-parse:', importError);
    return json(500, { error: `pdf-parse failed to load: ${importError.message}` });
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

    console.log('[parse-material-pdf] downloading from storage:', storagePath);
    const [buffer] = await bucket.file(storagePath).download();
    console.log('[parse-material-pdf] buffer size:', buffer.length);

    const data = await pdfParse(buffer);
    const parsedText = (data.text || '').replace(/\s+/g, ' ').trim();
    const previewText = parsedText.slice(0, 700);
    console.log('[parse-material-pdf] parsed chars:', parsedText.length);

    await materialRef.set({
      parsedText,
      previewText,
      parseStatus: 'complete',
      parseError: null,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    return json(200, { ok: true, characters: parsedText.length });
  } catch (error) {
    console.error('[parse-material-pdf] error:', error);
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
      console.error('[parse-material-pdf] failed to persist error:', nestedError);
    }
    return handleFunctionError(error);
  }
};
