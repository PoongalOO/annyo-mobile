import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage)
  },
  {
    path: 'favorites',
    loadComponent: () => import('./pages/favorites/favorites.page').then(m => m.FavoritesPage)
  },
  {
    path: 'reader/:id',
    loadComponent: () => import('./pages/reader/reader.page').then(m => m.ReaderPage)
  },
  {
    path: 'generator',
    loadComponent: () => import('./pages/generator/generator.page').then(m => m.GeneratorPage)
  }
];