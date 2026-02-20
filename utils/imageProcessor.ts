/**
 * Compresses an image file using HTML5 Canvas.
 * This runs on the main thread and is compatible with Vite production builds.
 */
export const compressImage = (file: File, maxWidth = 800, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log("Compression started for file:", file.name, "size:", file.size);

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      // Clean up the object URL
      URL.revokeObjectURL(objectUrl);

      let width = img.width;
      let height = img.height;

      // Calculate new dimensions while maintaining aspect ratio
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

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get 2d context for canvas'));
        return;
      }

      // Draw and scale the image
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to Data URL (JPEG)
      try {
        const result = canvas.toDataURL('image/jpeg', quality);
        console.log("Compression finished. New data URL length:", result.length);
        resolve(result);
      } catch (err) {
        console.error("Canvas toDataURL failed:", err);
        reject(err);
      }
    };

    img.onerror = (event) => {
      URL.revokeObjectURL(objectUrl);
      console.error("Image loading failed for compression:", event);
      reject(new Error('Failed to load image for compression. The file might be corrupted or an unsupported format.'));
    };

    img.src = objectUrl;
  });
};
