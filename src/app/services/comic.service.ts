import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import PouchDB from 'pouchdb-browser';
import { Comic } from '../models/comic.model';
import { COUCHDB_URL } from '../../db.config';

interface ComicDoc extends Omit<Comic, 'id'> {
  _id: string;
  _rev?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ComicService {
  private db = new PouchDB<ComicDoc>('comics');
  private comicsSubject = new BehaviorSubject<Comic[]>([]);
  public comics$ = this.comicsSubject.asObservable();

  constructor() {
    this.loadComics();
    this.setupSync();
  }

  private setupSync() {
    if (COUCHDB_URL) {
      this.db.sync(COUCHDB_URL, { live: true, retry: true }).on('change', () => this.loadComics());
    }
    this.db.changes({ since: 'now', live: true }).on('change', () => this.loadComics());
  }

  private async loadComics(): Promise<void> {
    try {
      const result = await this.db.allDocs({ include_docs: true });
      const comics = result.rows
        .map((row: PouchDB.Core.AllDocsRow<ComicDoc>) => {
          const doc = row.doc as ComicDoc;
          const { _id, _rev, ...rest } = doc;
          return { id: _id, ...rest } as Comic;
        })
        .sort((a: Comic, b: Comic) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      this.comicsSubject.next(comics);
    } catch (error) {
      console.error('Failed to load comics:', error);
      this.comicsSubject.next([]);
    }
  }

  addComic(comic: Omit<Comic, 'id'>): Comic {
    const id = new Date().toISOString();
    const newComic: Comic = { id, ...comic };
    const doc: ComicDoc = { _id: id, ...comic };
    this.db.put(doc).then(() => this.loadComics()).catch(console.error);
    this.comicsSubject.next([newComic, ...this.comicsSubject.getValue()]);
    return newComic;
  }

  updateComic(id: string, updates: Partial<Comic>): void {
    this.db
      .get(id)
      .then((doc: ComicDoc) => {
        const updated = { ...doc, ...updates };
        return this.db.put(updated);
      })
      .then(() => this.loadComics())
      .catch(console.error);

    const comics = this.comicsSubject.getValue();
    const index = comics.findIndex(c => c.id === id);
    if (index !== -1) {
      comics[index] = { ...comics[index], ...updates };
      this.comicsSubject.next([...comics]);
    }
  }

  deleteComic(id: string): void {
    this.db
      .get(id)
      .then((doc: ComicDoc) => this.db.remove(doc))
      .then(() => this.loadComics())
      .catch(console.error);
    const comics = this.comicsSubject.getValue().filter(c => c.id !== id);
    this.comicsSubject.next(comics);
  }

  getComicById(id: string): Comic | undefined {
    return this.comicsSubject.getValue().find(c => c.id === id);
  }

  getFavoriteComics(): Comic[] {
    return this.comicsSubject.getValue().filter(c => c.isFavorite);
  }

  processComicImage(file: File): Promise<string[]> {
    const isRowMostlyWhite = (
      ctx: CanvasRenderingContext2D,
      y: number,
      width: number,
      threshold = 250,
      ratio = 0.95
    ): boolean => {
      const data = ctx.getImageData(0, y, width, 1).data;
      let whitePixels = 0;
      for (let x = 0; x < width; x++) {
        const i = x * 4;
        if (data[i] >= threshold && data[i + 1] >= threshold && data[i + 2] >= threshold) {
          whitePixels++;
        }
      }
      return whitePixels / width > ratio;
    };

    const detectBottomWhiteMargin = (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number
    ): number => {
      let margin = 0;
      while (margin < height && isRowMostlyWhite(ctx, height - 1 - margin, width)) {
        margin++;
      }
      return margin;
    };

    const detectTopWhiteMargin = (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number
    ): number => {
      let margin = 0;
      while (margin < height && isRowMostlyWhite(ctx, margin, width)) {
        margin++;
      }
      return margin;
    };

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d');

          if (!tempCtx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          tempCanvas.width = img.width;
          tempCanvas.height = img.height;
          tempCtx.drawImage(img, 0, 0);

          const bottomMargin = detectBottomWhiteMargin(tempCtx, img.width, img.height);

          const topCrop = detectTopWhiteMargin(tempCtx, img.width, img.height - bottomMargin);

          const drawableHeight = img.height - topCrop - bottomMargin;
          const panelWidth = img.width / 2;
          const panelHeight = drawableHeight / 3;

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          canvas.width = panelWidth;
          canvas.height = panelHeight;

          const panels: string[] = [];

          for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 2; col++) {
              ctx.clearRect(0, 0, panelWidth, panelHeight);
              ctx.drawImage(
                img,
                col * panelWidth,
                topCrop + row * panelHeight,
                panelWidth,
                panelHeight,
                0,
                0,
                panelWidth,
                panelHeight
              );

              panels.push(canvas.toDataURL('image/jpeg', 0.9));
            }
          }

          resolve(panels);
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  createCoverImage(panels: string[]): string {
    return panels[0] || '';
  }
}