import { User, Article, CoralImage, SurveyResponse } from '../types';
import { MOCK_ARTICLES, MOCK_GALLERY } from '../constants';
import { get, set } from 'idb-keyval';

const KEYS = {
  USER: 'kilo_user',
  ARTICLES: 'kilo_articles',
  GALLERY: 'kilo_gallery',
  SURVEYS: 'kilo_surveys'
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

export const loadGallery = async (): Promise<CoralImage[]> => {
  try {
    // 1. Try IDB
    const stored = await get<CoralImage[]>(KEYS.GALLERY);
    if (stored) {
      return stored;
    }

    // 2. Migration: Check localStorage
    const localStored = localStorage.getItem(KEYS.GALLERY);
    if (localStored) {
      try {
        const parsed = JSON.parse(localStored);
        // Migrate to IDB
        await set(KEYS.GALLERY, parsed);
        // Clean up localStorage
        localStorage.removeItem(KEYS.GALLERY);
        return parsed;
      } catch (e) {
        console.error("Failed to parse local gallery for migration", e);
      }
    }

    // 3. Fallback
    return MOCK_GALLERY;
  } catch (e) {
    console.error("Failed to load gallery", e);
    return MOCK_GALLERY;
  }
};

export const saveGallery = async (images: CoralImage[]) => {
  try {
    await set(KEYS.GALLERY, images);
  } catch (e) {
    console.error("Failed to save gallery", e);
    // Likely quota exceeded
    alert("Storage limit reached. Some images may not be saved locally.");
  }
};

export const loadSurveys = (): SurveyResponse[] => {
  try {
    const stored = localStorage.getItem(KEYS.SURVEYS);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to load surveys", e);
    return [];
  }
};

export const saveSurveys = (surveys: SurveyResponse[]) => {
  try {
    localStorage.setItem(KEYS.SURVEYS, JSON.stringify(surveys));
  } catch (e) {
    console.error("Failed to save surveys", e);
  }
};

const downloadFile = (content: string, fileName: string, contentType: string) => {
  const a = document.createElement("a");
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(a.href);
};

export const exportSurveysToCSV = () => {
  const surveys = loadSurveys();
  if (surveys.length === 0) {
    alert("No survey data to export.");
    return;
  }

  const headers = ["ID", "Date", "Age Group", "Rating", "Topics Learned", "Buying Plan", "Feedback"];
  const csvContent = [
    headers.join(","),
    ...surveys.map(s => [
      s.id,
      s.date,
      s.ageGroup,
      s.rating,
      `"${s.topics.join('; ')}"`,
      `"${s.buyingPlan}"`,
      `"${s.feedback.replace(/"/g, '""')}"`
    ].join(","))
  ].join("\n");

  downloadFile(csvContent, `kilo_surveys_export_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
};

export const exportGalleryToJSON = () => {
  const gallery = loadGallery();
  const jsonContent = JSON.stringify(gallery, null, 2);
  downloadFile(jsonContent, `kilo_gallery_backup_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
};
