import { Comic, ComicStorage } from '../types';

const STORAGE_KEY = 'comic-reader-data';

export const getStoredData = (): ComicStorage => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { comics: [], lastId: 0 };
  } catch {
    return { comics: [], lastId: 0 };
  }
};

export const saveStoredData = (data: ComicStorage): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save data:', error);
  }
};

export const addComic = (comic: Omit<Comic, 'id'>): Comic => {
  const data = getStoredData();
  const newComic: Comic = {
    ...comic,
    id: (data.lastId + 1).toString(),
  };
  
  data.comics.push(newComic);
  data.lastId += 1;
  
  saveStoredData(data);
  return newComic;
};

export const updateComic = (id: string, updates: Partial<Comic>): void => {
  const data = getStoredData();
  const index = data.comics.findIndex(comic => comic.id === id);
  
  if (index !== -1) {
    data.comics[index] = { ...data.comics[index], ...updates };
    saveStoredData(data);
  }
};

export const deleteComic = (id: string): void => {
  const data = getStoredData();
  data.comics = data.comics.filter(comic => comic.id !== id);
  saveStoredData(data);
};

export const getComics = (): Comic[] => {
  return getStoredData().comics;
};

export const getFavoriteComics = (): Comic[] => {
  return getComics().filter(comic => comic.isFavorite);
};