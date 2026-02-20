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
import { Article } from '../types';

const COLLECTION_NAME = 'articles';

export const subscribeToArticles = (onUpdate: (articles: Article[]) => void) => {
  // Order by date descending (newest first)
  // Note: Firestore requires an index for this query if the collection is large,
  // but for small collections it works or will prompt for index creation in console.
  const q = query(collection(db, COLLECTION_NAME), orderBy('date', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const articles = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      } as Article;
    });
    onUpdate(articles);
  }, (error) => {
    console.error("Error fetching articles:", error);
    // In case of error (e.g., offline with no cache yet), we might want to handle it,
    // but onSnapshot usually handles offline gracefully by serving cache.
  });
};

export const saveArticle = async (article: Article) => {
  // We use setDoc to create or update the document with the specific ID
  const docRef = doc(db, COLLECTION_NAME, article.id);
  await setDoc(docRef, article);
};

export const deleteArticle = async (id: string) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
};

export const uploadArticleImage = async (blob: File | Blob, filename: string): Promise<string> => {
  if (!auth.currentUser) {
    throw new Error("You must be fully logged in to upload.");
  }

  const storageRef = ref(storage, `articles/${filename}`);
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
