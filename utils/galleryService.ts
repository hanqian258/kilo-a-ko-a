import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { ref, listAll, getDownloadURL, uploadBytesResumable, deleteObject, uploadBytes } from 'firebase/storage';
import { db, storage, auth } from './firebase';
import { CoralImage } from '../types';

const COLLECTION_NAME = 'gallery';

async function fetchFromFirestore(): Promise<CoralImage[]> {
  const snapshot = await getDocs(collection(db, COLLECTION_NAME));
  return snapshot.docs
    .map(d => ({ id: d.id, ...d.data() } as CoralImage))
    .sort((a, b) => {
      const da = typeof a.date === 'string' ? a.date : String(a.date);
      const db_ = typeof b.date === 'string' ? b.date : String(b.date);
      return db_.localeCompare(da);
    });
}

async function fetchFromStorage(): Promise<CoralImage[]> {
  const listRef = ref(storage, 'gallery');
  const result = await listAll(listRef);
  console.log('[Gallery] Storage fallback — items found:', result.items.length);
  return Promise.all(
    result.items.map(async (itemRef) => {
      const url = await getDownloadURL(itemRef);
      return {
        id: itemRef.name,
        url,
        uploaderName: 'Reef Steward',
        date: '',
        location: "Kahalu'u Bay",
        scientificName: '',
        description: '',
        milestones: [],
      } as CoralImage;
    })
  );
}

export async function fetchGallery(): Promise<CoralImage[]> {
  const TIMEOUT_MS = 6000;
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Firestore timeout')), TIMEOUT_MS)
  );
  try {
    return await Promise.race([fetchFromFirestore(), timeout]);
  } catch (err) {
    console.warn('[Gallery] Firestore unavailable, falling back to Storage:', err);
    return fetchFromStorage();
  }
}

export const saveGalleryImage = async (image: CoralImage | Omit<CoralImage, 'id'>) => {
  try {
    const finalPayload = {
      ...image,
      date: image.date || new Date().toISOString(),
    };

    if ('id' in image && image.id) {
      const docRef = doc(db, COLLECTION_NAME, image.id);
      await setDoc(docRef, finalPayload);
      console.log("Successfully updated Firestore document:", image.id);
    } else {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), finalPayload);
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
  const q = query(collection(db, COLLECTION_NAME), where('userId', '==', userId));

  return onSnapshot(q, (snapshot) => {
    const images = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as CoralImage))
      .sort((a, b) => {
        const da = typeof a.date === 'string' ? a.date : String(a.date);
        const db_ = typeof b.date === 'string' ? b.date : String(b.date);
        return db_.localeCompare(da);
      });
    onUpdate(images);
  }, (error) => {
    console.error("Error fetching user gallery:", error);
  });
};
