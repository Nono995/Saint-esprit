export interface Podcast {
  id: number;
  title: string;
  speaker: string;
  audio_url: string;
  description?: string;
  duration?: string;
  published_at?: string;
}

export interface Testimony {
  id: string; // Firestore doc id
  author: string;
  content: string;
  created_at?: string;
  publishedAt?: any; // Firestore Timestamp
  published?: boolean;
  archived?: boolean;
  likes?: number;
}

export interface Prayer {
  id: string; // Using string for Firestore document ID
  author: string;
  content: string;
  created_at?: string;
  publishedAt?: any; // Firestore Timestamp
  amens?: number;
  published?: boolean;
  archived?: boolean;
  commentsList?: { text: string; date: string; }[];
  title?: string;
  audioUrl?: string;
  duration?: number;
  date?: string;
  likes?: number;
  adminOnly?: boolean;
}

export interface Event {
  id: string;  // Firestore document ID
  title: string;
  description?: string;
  date: string;
  time: string;
  location: string;
  image_url?: string;
  created_at?: any; // Firestore Timestamp
}