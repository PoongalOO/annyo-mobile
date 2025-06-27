import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonProgressBar,
  IonGrid,
  IonRow,
  IonCol,
  IonImg,
  IonText,
  IonFooter,
  IonFab,
  IonFabButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  arrowBack, 
  chevronBack, 
  chevronForward, 
  heart, 
  star, 
  starOutline,
  home
} from 'ionicons/icons';
import { ComicService } from '../../services/comic.service';
import { Comic } from '../../models/comic.model';

@Component({
  selector: 'app-reader',
  templateUrl: './reader.page.html',
  styleUrls: ['./reader.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonProgressBar,
    IonGrid,
    IonRow,
    IonCol,
    IonImg,
    IonText,
    IonFooter,
    IonFab,
    IonFabButton
  ]
})
export class ReaderPage implements OnInit {
  comic: Comic | undefined = undefined;
  currentPanel = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private comicService: ComicService
  ) {
    addIcons({ 
      arrowBack, 
      chevronBack, 
      chevronForward, 
      heart, 
      star, 
      starOutline,
      home
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.comic = this.comicService.getComicById(id);
      if (!this.comic) {
        this.router.navigate(['/home']);
      }
    }

    // Keyboard navigation
    document.addEventListener('keydown', this.handleKeyPress.bind(this));
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.handleKeyPress.bind(this));
  }

  handleKeyPress(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowLeft':
        this.previousPanel();
        break;
      case 'ArrowRight':
        this.nextPanel();
        break;
      case 'Escape':
        this.goBack();
        break;
    }
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  nextPanel() {
    if (this.comic && this.currentPanel < this.comic.panels.length - 1) {
      this.currentPanel++;
    }
  }

  previousPanel() {
    if (this.currentPanel > 0) {
      this.currentPanel--;
    }
  }

  goToPanel(index: number) {
    this.currentPanel = index;
  }

  toggleFavorite() {
    if (this.comic) {
      this.comicService.updateComic(this.comic.id, { 
        isFavorite: !this.comic.isFavorite 
      });
      this.comic.isFavorite = !this.comic.isFavorite;
    }
  }

  updateRating(rating: number) {
    if (this.comic) {
      this.comicService.updateComic(this.comic.id, { rating });
      this.comic.rating = rating;
    }
  }

  getProgress(): number {
    if (!this.comic) return 0;
    return ((this.currentPanel + 1) / this.comic.panels.length) * 100;
  }

  getRatingStars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }
}