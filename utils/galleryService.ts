import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { ref, listAll, deleteObject, uploadBytes } from 'firebase/storage';
import { db, storage, auth } from './firebase';
import { CoralImage } from '../types';

const COLLECTION_NAME = 'gallery';

interface GalleryUploadResult {
  url: string;
  storagePath: string;
  filename: string;
}

const getStoragePath = (imageOrId: CoralImage | string) => {
  if (typeof imageOrId !== 'string') {
    return imageOrId.storagePath || `gallery/${imageOrId.id}`;
  }
  return imageOrId.startsWith('gallery/') ? imageOrId : `gallery/${imageOrId}`;
};

const getFirestoreId = (imageOrId: CoralImage | string) => {
  if (typeof imageOrId === 'string') return imageOrId.replace(/^gallery\//, '');
  return imageOrId.firestoreId || imageOrId.id.replace(/^gallery\//, '');
};

export async function fetchGallery(): Promise<CoralImage[]> {
  console.log('[Gallery] Fetching from Storage...');
  const listRef = ref(storage, 'gallery');
  const result = await listAll(listRef);
  console.log('[Gallery] Items found in Storage:', result.items.length);

  let metadataByStoragePath = new Map<string, Partial<CoralImage>>();
  try {
    const metadataSnapshot = await Promise.race([
      getDocs(collection(db, COLLECTION_NAME)),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Firestore metadata fetch timed out')), 2500))
    ]);
    metadataByStoragePath = new Map(
      metadataSnapshot.docs.map((snapshotDoc) => {
        const data = snapshotDoc.data() as Partial<CoralImage>;
        const storagePath = data.storagePath || `gallery/${snapshotDoc.id}`;
        return [storagePath, { ...data, firestoreId: snapshotDoc.id }];
      })
    );
  } catch (error) {
    console.warn('[Gallery] Firestore metadata unavailable; using Storage-only gallery records.', error);
  }

  const images = result.items.map((itemRef) => {
    const encodedPath = encodeURIComponent(itemRef.fullPath);
    const bucket = itemRef.bucket;
    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media`;
    const metadata = metadataByStoragePath.get(itemRef.fullPath) || {};

    const fallback: CoralImage = {
      id: itemRef.name,
      url,
      storagePath: itemRef.fullPath,
      uploaderName: 'Reef Steward',
      date: 'Recent',
      location: "Kahalu'u Bay",
      scientificName: '',
      description: "Community coral monitoring photo from Kahalu'u Bay.",
      milestones: [
        {
          id: `m-${itemRef.name}`,
          date: 'Recent',
          title: 'Observation Logged',
          description: "Community coral monitoring photo from Kahalu'u Bay.",
          status: 'healthy',
          imageUrl: url,
        },
      ],
    };

    return {
      ...fallback,
      ...metadata,
      id: metadata.id || itemRef.name,
      url: metadata.url || url,
      storagePath: metadata.storagePath || itemRef.fullPath,
    } as CoralImage;
  });

  // Newest first (filenames embed timestamps)
  return images.sort((a, b) => b.id.localeCompare(a.id));
}

export const saveGalleryImage = async (image: CoralImage | Omit<CoralImage, 'id'>) => {
  try {
    const finalPayload = {
      ...image,
      date: image.date || new Date().toISOString(),
    };

    if ('id' in image && image.id) {
      const docId = image.firestoreId || image.id.replace(/^gallery\//, '');
      const docRef = doc(db, COLLECTION_NAME, docId);
      await setDoc(docRef, { ...finalPayload, firestoreId: docId }, { merge: true });
      console.log("Successfully updated Firestore document:", docId);
    } else {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), finalPayload);
      console.log("Successfully written to Firestore with ID:", docRef.id);
    }
  } catch (error) {
    console.error("Firestore Write Failure:", error);
    throw error;
  }
};

export const uploadGalleryImage = async (blob: File | Blob, filename: string): Promise<GalleryUploadResult> => {
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
  const encodedPath = encodeURIComponent(storageRef.fullPath);
  const url = `https://firebasestorage.googleapis.com/v0/b/${storageRef.bucket}/o/${encodedPath}?alt=media`;
  return { url, storagePath: storageRef.fullPath, filename };
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

export const deleteGalleryImage = async (imageOrId: CoralImage | string) => {
  const storagePath = getStoragePath(imageOrId);
  const firestoreId = getFirestoreId(imageOrId);

  try {
    await deleteObject(ref(storage, storagePath));
  } catch (error: any) {
    if (error?.code !== 'storage/object-not-found') {
      console.error("Failed to delete image from storage:", error);
      throw error;
    }
  }

  try {
    await deleteDoc(doc(db, COLLECTION_NAME, firestoreId));
  } catch (error) {
    console.error("Failed to delete Firestore gallery document:", error);
    throw error;
  }
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
