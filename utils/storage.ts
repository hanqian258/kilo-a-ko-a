import { User, Article, CoralImage } from '../types';
import { MOCK_ARTICLES, MOCK_GALLERY } from '../constants';

const KEYS = {
  USER: 'kilo_user',
  ARTICLES: 'kilo_articles',
  GALLERY: 'kilo_gallery'
};

export const loadUser = (): User | null => {
  try {
    const stored = localStorage.getItem(KEYS.USER);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.error("Failed to load user", e);
    return null;
  }
};

export const saveUser = (user: User | null) => {
  try {
    if (user) {
      localStorage.setItem(KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEYS.USER);
    }
  } catch (e) {
    console.error("Failed to save user", e);
  }
};

export const loadArticles = (): Article[] => {
  try {
    const stored = localStorage.getItem(KEYS.ARTICLES);
    return stored ? JSON.parse(stored) : MOCK_ARTICLES;
  } catch (e) {
    console.error("Failed to load articles", e);
    return MOCK_ARTICLES;
  }
};

export const saveArticles = (articles: Article[]) => {
  try {
    localStorage.setItem(KEYS.ARTICLES, JSON.stringify(articles));
  } catch (e) {
    console.error("Failed to save articles", e);
  }
};

export const loadGallery = (): CoralImage[] => {
  try {
    const stored = localStorage.getItem(KEYS.GALLERY);
    return stored ? JSON.parse(stored) : MOCK_GALLERY;
  } catch (e) {
    console.error("Failed to load gallery", e);
    return MOCK_GALLERY;
  }
};

export const saveGallery = (images: CoralImage[]) => {
  try {
    localStorage.setItem(KEYS.GALLERY, JSON.stringify(images));
  } catch (e) {
    console.error("Failed to save gallery", e);
    // Likely quota exceeded
    alert("Storage limit reached. Some images may not be saved locally.");
  }
};
