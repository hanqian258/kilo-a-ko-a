import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from './firebase';
import { Event } from '../types';

const COLLECTION_NAME = 'events';

export const subscribeToEvents = (onUpdate: (events: Event[]) => void) => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('date', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      } as Event;
    });
    onUpdate(events);
  }, (error) => {
    console.error("Firestore Permission Error:", error);
  });
};

export const saveEvent = async (event: Event) => {
  const docRef = doc(db, COLLECTION_NAME, event.id);
  await setDoc(docRef, event);
};

export const deleteEvent = async (id: string) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
};

export const uploadEventImage = async (blob: File | Blob, filename: string): Promise<string> => {
  if (!auth.currentUser) {
    throw new Error("You must be fully logged in to upload.");
  }

  const storageRef = ref(storage, `events/${filename}`);
  const metadata = { contentType: 'image/jpeg' };

  console.log("--- UPLOAD DEBUG LOGS ---");
  console.log("1. Auth User UID:", auth.currentUser?.uid || "NULL - USER NOT LOGGED IN");
  console.log("2. Upload Path:", storageRef.fullPath);
  console.log("3. Metadata Object:", metadata);
  console.log("4. Blob Size (bytes):", blob.size);
  console.log("-------------------------");

  await uploadBytes(storageRef, blob, metadata);
  return getDownloadURL(storageRef);
};
