import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, uploadBytesResumable, deleteObject, uploadBytes } from 'firebase/storage';
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

export const uploadGalleryImage = async (fileOrDataUrl: File | Blob | string, filename: string): Promise<string> => {
  const storageRef = ref(storage, `gallery/${filename}`);

  let blob: Blob | File;
  if (typeof fileOrDataUrl === 'string' && fileOrDataUrl.startsWith('data:')) {
    blob = dataURLtoBlob(fileOrDataUrl);
  } else if (typeof fileOrDataUrl === 'string') {
    // Treat as base64 without prefix if not starting with data:
    await uploadString(storageRef, fileOrDataUrl, 'base64');
    return getDownloadURL(storageRef);
  } else {
    blob = fileOrDataUrl;
  }

  // We assume compression has already happened via imageProcessor.ts if needed
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
};

export const deleteImageFromStorage = async (url: string) => {
  if (url && url.includes('firebasestorage.googleapis.com')) {
    try {
      const storageRef = ref(storage, url);
      await deleteObject(storageRef);
    } catch (error) {
      console.error("Failed to delete image from storage:", error);
    }
  }
};

export const deleteGalleryImage = async (id: string) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data() as CoralImage;
    await deleteImageFromStorage(data.url);
  }

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
