export const compressImage = (file: File, maxWidth = 800, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log("Compression started");

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

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

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.error("Failed to get 2D context");
          reject(new Error('Could not get 2d context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Compress and get Data URL
        try {
          const result = canvas.toDataURL('image/jpeg', quality);
          console.log("Compression finished");
          resolve(result);
        } catch (err) {
          console.error("Canvas toDataURL failed", err);
          reject(err);
        }
      };

      img.onerror = (err) => {
        console.error("Image loading failed", err);
        reject(new Error('Failed to load image for compression'));
      };
    };

    reader.onerror = (err) => {
      console.error("FileReader failed", err);
      reject(new Error('Failed to read file'));
    };
  });
};
