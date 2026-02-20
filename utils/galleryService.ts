import {
  collection,
  addDoc,
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
import { db, storage, auth } from './firebase';
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

export const saveGalleryImage = async (image: CoralImage | Omit<CoralImage, 'id'>) => {
  try {
    if ('id' in image && image.id) {
      const docRef = doc(db, COLLECTION_NAME, image.id);
      await setDoc(docRef, image);
      console.log("Successfully updated Firestore document:", image.id);
    } else {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), image);
      console.log("Successfully written to Firestore with ID:", docRef.id);
    }
  } catch (error) {
    console.error("Firestore Write Failure:", error);
    throw error;
  }
};

export const uploadGalleryImage = async (blob: File | Blob, filename: string): Promise<string> => {
  const storageRef = ref(storage, `gallery/${filename}`);
  const metadata = { contentType: 'image/jpeg' };

  console.log("--- UPLOAD DEBUG LOGS ---");
  console.log("1. Auth User UID:", auth.currentUser?.uid || "NULL - USER NOT LOGGED IN");
  console.log("2. Upload Path:", storageRef.fullPath);
  console.log("3. Metadata Object:", metadata);
  console.log("4. Blob Size (bytes):", blob.size);
  console.log("-------------------------");

  if (!auth.currentUser) {
    console.error("Auth State:", auth);
    throw new Error("Fatal: Firebase Auth token is missing. Cannot upload.");
  }
  console.log("Uploading as UID:", auth.currentUser.uid);

  // We assume compression has already happened via imageProcessor.ts if needed
  await uploadBytes(storageRef, blob, metadata);
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
