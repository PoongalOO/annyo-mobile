import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
  import {
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonFab,
    IonFabButton,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonButtons,
    IonModal,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonDatetime,
    IonProgressBar,
    IonToast,
    IonImg,
    IonText,
    IonBadge,
    IonChip,
    IonAlert
  } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, book, heart, star, starOutline, calendar, trash } from 'ionicons/icons';
import { ComicService } from '../../services/comic.service';
import { Comic } from '../../models/comic.model';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonFab,
    IonFabButton,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonButtons,
    IonModal,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonDatetime,
    IonProgressBar,
    IonToast,
    IonImg,
    IonText,
    IonBadge,
    IonChip,
    IonAlert
  ],
})
export class HomePage implements OnInit, OnDestroy {
  comics: Comic[] = [];
  isAddModalOpen = false;
  isProcessing = false;
  showToast = false;
  toastMessage = '';
  showDeleteAlert = false;
  comicToDelete: Comic | null = null;
  
  newComic = {
    title: '',
    publishDate: '',
    file: null as File | null
  };

  private subscription?: Subscription;

  constructor(
    private comicService: ComicService,
    private router: Router
  ) {
    addIcons({ add, book, heart, star, starOutline, calendar, trash });
  }

  ngOnInit() {
    this.subscription = this.comicService.comics$.subscribe(comics => {
      this.comics = comics;
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  openAddModal() {
    this.isAddModalOpen = true;
  }

  closeAddModal() {
    this.isAddModalOpen = false;
    this.resetForm();
  }

  resetForm() {
    this.newComic = {
      title: '',
      publishDate: '',
      file: null
    };
    this.isProcessing = false;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.newComic.file = file;
    }
  }

  async addComic() {
    if (!this.newComic.title || !this.newComic.publishDate || !this.newComic.file) {
      this.showToastMessage('Veuillez remplir tous les champs');
      return;
    }

    this.isProcessing = true;

    try {
      const panels = await this.comicService.processComicImage(this.newComic.file);
      const coverImage = this.comicService.createCoverImage(panels);

      this.comicService.addComic({
        title: this.newComic.title,
        panels,
        publishDate: this.newComic.publishDate,
        coverImage,
        isFavorite: false,
        rating: 0,
        createdAt: new Date().toISOString()
      });

      this.showToastMessage('BD ajoutée avec succès !');
      this.closeAddModal();
    } catch (error) {
      console.error('Error processing comic:', error);
      this.showToastMessage('Erreur lors du traitement de l\'image');
    } finally {
      this.isProcessing = false;
    }
  }

  readComic(comic: Comic) {
    this.router.navigate(['/reader', comic.id]);
  }

  toggleFavorite(comic: Comic, event: Event) {
    event.stopPropagation();
    this.comicService.updateComic(comic.id, { isFavorite: !comic.isFavorite });
  }

  updateRating(comic: Comic, rating: number, event: Event) {
    event.stopPropagation();
    this.comicService.updateComic(comic.id, { rating });
  }

  confirmDelete(comic: Comic, event: Event) {
    event.stopPropagation();
    this.comicToDelete = comic;
    this.showDeleteAlert = true;
  }

  deleteComic() {
    if (this.comicToDelete) {
      this.comicService.deleteComic(this.comicToDelete.id);
      this.showToastMessage('BD supprimée avec succès');
      this.comicToDelete = null;
    }
    this.showDeleteAlert = false;
  }

  cancelDelete() {
    this.comicToDelete = null;
    this.showDeleteAlert = false;
  }

  onAlertDismiss(event: any) {
    const role = event.detail.role;
    if (role === 'destructive') {
      this.deleteComic();
    } else {
      this.cancelDelete();
    }
  }

  goToFavorites() {
    this.router.navigate(['/favorites']);
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