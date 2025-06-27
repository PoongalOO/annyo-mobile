import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Comic, ComicStorage } from '../models/comic.model';

@Injectable({
  providedIn: 'root'
})
export class ComicService {
  private readonly STORAGE_KEY = 'comic-reader-data';
  private comicsSubject = new BehaviorSubject<Comic[]>([]);
  public comics$ = this.comicsSubject.asObservable();

  constructor() {
    this.loadComics();
  }

  private getStoredData(): ComicStorage {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : { comics: [], lastId: 0 };
    } catch {
      return { comics: [], lastId: 0 };
    }
  }

  private saveStoredData(data: ComicStorage): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      this.comicsSubject.next(data.comics);
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }

  private loadComics(): void {
    const data = this.getStoredData();
    this.comicsSubject.next(data.comics);
  }

  addComic(comic: Omit<Comic, 'id'>): Comic {
    const data = this.getStoredData();
    const newComic: Comic = {
      ...comic,
      id: (data.lastId + 1).toString(),
    };
    
    data.comics.unshift(newComic);
    data.lastId += 1;
    
    this.saveStoredData(data);
    return newComic;
  }

  updateComic(id: string, updates: Partial<Comic>): void {
    const data = this.getStoredData();
    const index = data.comics.findIndex(comic => comic.id === id);
    
    if (index !== -1) {
      data.comics[index] = { ...data.comics[index], ...updates };
      this.saveStoredData(data);
    }
  }

  deleteComic(id: string): void {
    const data = this.getStoredData();
    data.comics = data.comics.filter(comic => comic.id !== id);
    this.saveStoredData(data);
  }

  getComicById(id: string): Comic | undefined {
    const data = this.getStoredData();
    return data.comics.find(comic => comic.id === id);
  }

  getFavoriteComics(): Comic[] {
    const data = this.getStoredData();
    return data.comics.filter(comic => comic.isFavorite);
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