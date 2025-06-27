import PouchDB from 'pouchdb';
import { Comic } from '../types';
import { COUCHDB_URL } from '../db.config';

interface ComicDoc extends Comic {
  _id: string;
  _rev?: string;
}

const db = new PouchDB<ComicDoc>('comics');
let comicsCache: Comic[] = [];

const loadComics = async () => {
  try {
    const result = await db.allDocs({ include_docs: true });
    comicsCache = result.rows.map(r => {
      const doc = r.doc as ComicDoc;
      const { _id, _rev, ...rest } = doc;
      return { id: _id, ...rest } as Comic;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (e) {
    console.error('Failed to load comics:', e);
    comicsCache = [];
  }
};

loadComics();

db.changes({ since: 'now', live: true }).on('change', loadComics);

if (COUCHDB_URL) {
  db.sync(COUCHDB_URL, { live: true, retry: true }).on('change', loadComics);
}

export const getComics = (): Comic[] => comicsCache;

export const addComic = (comic: Omit<Comic, 'id'>): Comic => {
  const id = new Date().toISOString();
  const doc: ComicDoc = { _id: id, ...comic };
  db.put(doc).catch(console.error);
  const newComic: Comic = { id, ...comic };
  comicsCache.unshift(newComic);
  return newComic;
};

export const updateComic = (id: string, updates: Partial<Comic>): void => {
  db.get(id)
    .then(doc => db.put({ ...(doc as ComicDoc), ...updates }))
    .catch(console.error);
  const index = comicsCache.findIndex(c => c.id === id);
  if (index !== -1) {
    comicsCache[index] = { ...comicsCache[index], ...updates };
  }
};

export const deleteComic = (id: string): void => {
  db.get(id)
    .then(doc => db.remove(doc))
    .catch(console.error);
  comicsCache = comicsCache.filter(c => c.id !== id);
};

export const getFavoriteComics = (): Comic[] => comicsCache.filter(c => c.isFavorite);
