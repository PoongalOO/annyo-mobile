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
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          // Calculate panel dimensions (2 columns, 3 rows)
          const panelWidth = img.width / 2;
          const panelHeight = img.height / 3;
          
          canvas.width = panelWidth;
          canvas.height = panelHeight;
          
          const panels: string[] = [];
          
          // Extract each panel
          for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 2; col++) {
              ctx.clearRect(0, 0, panelWidth, panelHeight);
              ctx.drawImage(
                img,
                col * panelWidth,
                row * panelHeight,
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