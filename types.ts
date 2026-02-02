export interface FeedSource {
  id: string;
  name: string;
  url: string;
  category: 'tech' | 'programming' | 'general';
}

export interface Article {
  id: string;
  feedId: string;
  feedName: string;
  title: string;
  link: string;
  contentSnippet: string;
  pubDate: string; // ISO string
  timestamp: number;
}

export interface SearchResult extends Article {
  similarity: number;
}

export type ViewMode = 'all' | 'today' | 'favorites' | 'source';

export interface FeedState {
  articles: Article[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: number;
}