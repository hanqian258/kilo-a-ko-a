let worker: Worker | null = null;

// Map request IDs to promise callbacks
const pendingRequests = new Map<string, { resolve: (url: string) => void, reject: (err: any) => void }>();

const getWorker = () => {
  if (!worker) {
    // Create worker using standard ESM syntax compatible with Vite
    worker = new Worker(new URL('./imageCompression.worker.ts', import.meta.url), {
      type: 'module',
    });

    worker.onmessage = (event) => {
      const { id, result, error, success } = event.data;
      const request = pendingRequests.get(id);

      if (request) {
        if (success) {
          request.resolve(result);
        } else {
          request.reject(new Error(error || 'Unknown worker error'));
        }
        pendingRequests.delete(id);
      }
    };

    worker.onerror = (error) => {
      console.error('Worker error:', error);
    };
  }
  return worker;
};

export const compressImage = (file: File, maxWidth = 800, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const workerInstance = getWorker();
      const id = Math.random().toString(36).substring(2, 15);

      pendingRequests.set(id, { resolve, reject });

      workerInstance.postMessage({
        file,
        maxWidth,
        quality,
        id
      });
    } catch (error) {
      reject(error);
    }
  });
};
