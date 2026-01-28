/// <reference lib="webworker" />

self.onmessage = async (e: MessageEvent) => {
  const { file, maxWidth, quality, id } = e.data;

  try {
    const bitmap = await createImageBitmap(file);
    let width = bitmap.width;
    let height = bitmap.height;

    // Calculate new dimensions
    if (width > height) {
      if (width > maxWidth) {
        height *= maxWidth / width;
        width = maxWidth;
      }
    } else {
      if (height > maxWidth) {
        width *= maxWidth / height;
        height = maxWidth;
      }
    }

    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2d context');

    ctx.drawImage(bitmap, 0, 0, width, height);

    // Compress
    const blob = await canvas.convertToBlob({
      type: 'image/jpeg',
      quality: quality
    });

    if (!blob) throw new Error('Compression failed');

    // Convert to Base64 string to match original API
    const reader = new FileReader();
    reader.onloadend = () => {
      self.postMessage({ id, result: reader.result as string, success: true });
    };
    reader.onerror = () => {
      self.postMessage({ id, error: 'FileReader failed', success: false });
    };
    reader.readAsDataURL(blob);

  } catch (error) {
    self.postMessage({ id, error: (error as Error).message, success: false });
  }
};
