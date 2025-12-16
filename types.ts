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

export interface CoralImage {
  id: string;
  url: string;
  uploaderName: string;
  date: string;
  location: string;
  description: string;
  aiAnalysis?: string;
  scientificName?: string;
}

export interface SurveyResponse {
  eventId: string;
  rating: number;
  comments: string;
  interestedInVolunteering: boolean;
}

export interface Donation {
  id: string;
  date: string;
  amount: number;
  campaign: string;
}

export enum Page {
  HOME = 'HOME',
  FUNDRAISER = 'FUNDRAISER',
  AWARENESS = 'AWARENESS',
  GALLERY = 'GALLERY',
  LOGIN = 'LOGIN',
  PROFILE = 'PROFILE'
}