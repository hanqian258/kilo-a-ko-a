import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';
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
    console.error("Error fetching events:", error);
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
