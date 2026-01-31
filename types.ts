export enum UserRole {
  DONOR = 'DONOR',
  SCIENTIST = 'SCIENTIST',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  attendedEvents?: string[];
  readArticles?: string[];
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  imageUrl: string;
  tags: string[];
}

export interface CoralMilestone {
  id: string;
  date: string;
  title: string;
  description: string;
  status: 'healthy' | 'warning' | 'recovery';
  imageUrl?: string;
}

export interface CoralImage {
  id: string;
  url: string;
  uploaderName: string;
  date: string;
  location: string;
  description: string;
  aiAnalysis?: string;
  scientificName?: string;
  milestones?: CoralMilestone[];
  userId?: string;
}

export interface SurveyResponse {
  id: string;
  date: string;
  ageGroup: 'under18' | 'over18';
  // New fields
  interestedPrior?: string;
  priorKnowledge?: number;
  topicsLearned?: string;
  experienceRating?: number;
  likedOrWantedMore?: string;
  needsChanging?: string;
  wantToLearnMore?: string;
  // Old fields
  rating?: number;
  topics?: string[];
  buyingPlan?: string;
  feedback?: string;

  // Centralized data fields
  userId?: string;
  userName?: string;
  location?: { latitude: number; longitude: number } | string | null;
  category?: string;
}

export interface Donation {
  id: string;
  date: string;
  amount: number;
  campaign: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  endTime?: string;
  location: string;
  description: string;
  attendees: string[];
  status?: 'upcoming' | 'ongoing' | 'canceled';
  imageUrl?: string;
}

export enum Page {
  HOME = 'HOME',
  FUNDRAISER = 'FUNDRAISER',
  AWARENESS = 'AWARENESS',
  EVENTS = 'EVENTS',
  GALLERY = 'GALLERY',
  LOGIN = 'LOGIN',
  PROFILE = 'PROFILE',
  NOT_FOUND = 'NOT_FOUND'
}
