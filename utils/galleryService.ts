import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { db, storage } from './firebase';
import { CoralImage } from '../types';

const COLLECTION_NAME = 'gallery';

export const subscribeToGallery = (onUpdate: (images: CoralImage[]) => void) => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('date', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const images = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      } as CoralImage;
    });
    onUpdate(images);
  }, (error) => {
    console.error("Error fetching gallery:", error);
  });
};

export const saveGalleryImage = async (image: CoralImage) => {
  const docRef = doc(db, COLLECTION_NAME, image.id);
  await setDoc(docRef, image);
};

const dataURLtoBlob = (dataurl: string): Blob => {
  const arr = dataurl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

export const uploadGalleryImage = async (base64Data: string, filename: string): Promise<string> => {
  const storageRef = ref(storage, `corals/${filename}`);

  // If caller provided a data URL, convert to Blob to avoid base64 overhead
  let blob: Blob;
  if (base64Data.startsWith('data:')) {
    try {
      blob = dataURLtoBlob(base64Data);
    } catch (err) {
      // fallback to uploadString if conversion fails
      await uploadString(storageRef, base64Data, 'data_url');
      return getDownloadURL(storageRef);
    }
  } else {
    // assume already a binary string or blob-like base64; attempt to upload as data_url
    await uploadString(storageRef, base64Data, 'data_url');
    return getDownloadURL(storageRef);
  }

  // Use resumable upload for better reliability and progress
  await new Promise<void>((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, blob);
    uploadTask.on('state_changed',
      () => {
        // could surface progress via an event emitter or callback in future
      },
      (error) => reject(error),
      () => resolve()
    );
  });

  return getDownloadURL(storageRef);
};

export const deleteGalleryImage = async (id: string) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
};

export const subscribeToUserGallery = (userId: string, onUpdate: (images: CoralImage[]) => void) => {
  const q = query(collection(db, COLLECTION_NAME), where('userId', '==', userId), orderBy('date', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const images = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      } as CoralImage;
    });
    onUpdate(images);
  }, (error) => {
    console.error("Error fetching user gallery:", error);
  });
};
