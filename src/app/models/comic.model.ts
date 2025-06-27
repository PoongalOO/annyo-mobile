export interface Comic {
  id: string;
  title: string;
  panels: string[];
  publishDate: string;
  isFavorite: boolean;
  rating: number;
  coverImage: string;
  createdAt: string;
}

export interface ComicStorage {
  comics: Comic[];
  lastId: number;
}