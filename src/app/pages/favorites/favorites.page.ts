import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonImg,
  IonText,
  IonSelect,
  IonSelectOption,
  IonBadge,
  IonAlert,
  IonToast
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBack, heart, star, starOutline, calendar, trash, funnel } from 'ionicons/icons';
import { ComicService } from '../../services/comic.service';
import { Comic } from '../../models/comic.model';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.page.html',
  styleUrls: ['./favorites.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonImg,
    IonText,
    IonSelect,
    IonSelectOption,
    IonBadge,
    IonAlert,
    IonToast
  ]
})
export class FavoritesPage implements OnInit {
  favorites: Comic[] = [];
  sortBy: 'title' | 'rating' | 'date' = 'title';
  showDeleteAlert = false;
  comicToDelete: Comic | null = null;
  showToast = false;
  toastMessage = '';

  constructor(
    private comicService: ComicService,
    private router: Router
  ) {
    addIcons({ arrowBack, heart, star, starOutline, calendar, trash, funnel });
  }

  ngOnInit() {
    this.loadFavorites();
  }

  ionViewWillEnter() {
    this.loadFavorites();
  }

  loadFavorites() {
    this.favorites = this.comicService.getFavoriteComics();
    this.sortFavorites();
  }

  sortFavorites() {
    this.favorites.sort((a, b) => {
      switch (this.sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'date':
          return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
        default:
          return a.title.localeCompare(b.title);
      }
    });
  }

  onSortChange() {
    this.sortFavorites();
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  readComic(comic: Comic) {
    this.router.navigate(['/reader', comic.id]);
  }

  toggleFavorite(comic: Comic, event: Event) {
    event.stopPropagation();
    this.comicService.updateComic(comic.id, { isFavorite: false });
    this.loadFavorites();
    this.showToastMessage('BD retirée des favoris');
  }

  updateRating(comic: Comic, rating: number, event: Event) {
    event.stopPropagation();
    this.comicService.updateComic(comic.id, { rating });
    this.loadFavorites();
  }

  confirmDelete(comic: Comic, event: Event) {
    event.stopPropagation();
    this.comicToDelete = comic;
    this.showDeleteAlert = true;
  }

  deleteComic() {
    if (this.comicToDelete) {
      this.comicService.deleteComic(this.comicToDelete.id);
      this.loadFavorites();
      this.showToastMessage('BD supprimée avec succès');
      this.comicToDelete = null;
    }
    this.showDeleteAlert = false;
  }

  cancelDelete() {
    this.comicToDelete = null;
    this.showDeleteAlert = false;
  }

  private showToastMessage(message: string) {
    this.toastMessage = message;
    this.showToast = true;
  }

  getRatingStars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR');
  }
}