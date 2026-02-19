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
import { db } from './firebase';
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
