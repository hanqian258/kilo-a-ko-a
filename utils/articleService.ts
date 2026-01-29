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
