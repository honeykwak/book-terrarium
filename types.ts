
export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface Message {
  id: string;
  sessionId?: string; // Linked to ChatSession
  role: Role;
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  isSystem?: boolean;
  recommendedBooks?: Book[];
}

export interface ChatSession {
  id: string;
  userId: string;
  userBookId?: string | null;
  expiresAt?: Date | null;
  createdAt: Date;
}

export enum ModelType {
  FLASH = 'gemini-2.5-flash',
  PRO = 'gemini-2.5-pro'
}

export interface ReportAnalytics {
  emotionAnalysis: {
    primary: string;
    intensity: number; // 1-10
    keywords: string[];
  };
  readingHabits: {
    sessionCount: number;
    avgDurationMinutes: number;
  };
  growthAreas: string[];
}

export interface UserProfile {
  id: string;
  nickname: string;
  email: string;
  avatarUrl?: string;
  preferredLibCodes?: string[]; // For library inventory checks
}

export interface Book {
  id: string; // user_books.id
  bookId?: string; // books.id (public cache)
  isbn?: string; // ISBN13
  title: string;
  author: string;
  publisher?: string;
  coverColor?: string; // Legacy/Fallback
  coverUrl?: string;
  description?: string;

  // User Status
  status?: 'READING' | 'COMPLETED' | 'WISH';
  startDate?: Date;
  completedDate?: Date;
  rating?: number;
  review?: string;
  report?: ReportAnalytics;
  isShared?: boolean;
}

export interface CommunityPost {
  id: string; // user_books.id
  user: UserProfile;
  book: Book;
  likes: number;
  isLiked: boolean;
  createdAt: Date;
}

export interface Settings {
  notifications: boolean;
  theme: 'light' | 'dark' | 'system';
  language: 'ko' | 'en';
}
