import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore';
import { deleteObject, ref, uploadBytes } from 'firebase/storage';
import { auth, db, storage } from './firebase';
import { EducationalMaterial } from '../types';

const COLLECTION_NAME = 'materials';

const getStorageUrl = (storagePath: string) => {
  const encodedPath = encodeURIComponent(storagePath);
  return `https://firebasestorage.googleapis.com/v0/b/${storage.app.options.storageBucket}/o/${encodedPath}?alt=media`;
};

export const subscribeToMaterials = (
  onUpdate: (materials: EducationalMaterial[]) => void,
  onError?: (error: Error) => void
) => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('updatedAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const materials = snapshot.docs.map((snapshotDoc) => ({
      id: snapshotDoc.id,
      ...snapshotDoc.data(),
    } as EducationalMaterial));
    onUpdate(materials);
  }, (error) => {
    console.error('Error fetching materials:', error);
    onError?.(error);
  });
};

/** Strip undefined values so Firestore doesn't reject the write. */
const cleanForFirestore = <T extends object>(obj: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;

export const saveMaterial = async (material: EducationalMaterial) => {
  await setDoc(doc(db, COLLECTION_NAME, material.id), cleanForFirestore(material), { merge: true });
};

export const uploadMaterialPdf = async (materialId: string, file: File): Promise<{ storagePath: string; downloadUrl: string }> => {
  if (!auth.currentUser) {
    throw new Error('You must be signed in to upload materials.');
  }

  const storagePath = `materials/${materialId}/source.pdf`;
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, file, { contentType: 'application/pdf' });

  return {
    storagePath,
    downloadUrl: getStorageUrl(storagePath),
  };
};

export const deleteMaterial = async (material: EducationalMaterial) => {
  if (material.storagePath) {
    try {
      await deleteObject(ref(storage, material.storagePath));
    } catch (error: any) {
      if (error?.code !== 'storage/object-not-found') {
        throw error;
      }
    }
  }

  await deleteDoc(doc(db, COLLECTION_NAME, material.id));
};

export const requestPdfParsing = async (materialId: string, storagePath: string) => {
  const idToken = await auth.currentUser?.getIdToken();
  if (!idToken) throw new Error('You must be signed in to parse materials.');

  const response = await fetch('/.netlify/functions/parse-material-pdf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ materialId, storagePath }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'PDF parsing failed.');
  }
};

export const sendDigestEmail = async (payload: {
  subject: string;
  message: string;
  materialIds: string[];
}) => {
  const idToken = await auth.currentUser?.getIdToken();
  if (!idToken) throw new Error('You must be signed in to send email digests.');

  const response = await fetch('/.netlify/functions/send-digest-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Digest email failed.');
  }
  return data as { recipientCount: number; campaignId: string };
};
