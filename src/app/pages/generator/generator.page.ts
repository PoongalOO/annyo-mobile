import { Component } from '@angular/core';
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
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonCard,
  IonCardContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBack, construct } from 'ionicons/icons';

@Component({
  selector: 'app-generator',
  templateUrl: './generator.page.html',
  styleUrls: ['./generator.page.scss'],
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
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonCard,
    IonCardContent
  ]
})
export class GeneratorPage {
  speech = '';
  expression: 'happy' | 'sad' | 'surprised' = 'happy';
  generated = false;

  imageMap: Record<string, string> = {
    happy: 'assets/generator/happy.svg',
    sad: 'assets/generator/sad.svg',
    surprised: 'assets/generator/surprised.svg'
  };

  constructor(private router: Router) {
    addIcons({ arrowBack, construct });
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  generate() {
    this.generated = true;
  }
}
