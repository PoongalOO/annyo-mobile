import React, { useState } from 'react';
import { HomePage } from './pages/HomePage';
import { FavoritesPage } from './pages/FavoritesPage';

type Page = 'home' | 'favorites';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  return (
    <div className="App">
      {currentPage === 'home' && (
        <HomePage onNavigateToFavorites={() => setCurrentPage('favorites')} />
      )}
      
      {currentPage === 'favorites' && (
        <FavoritesPage onNavigateHome={() => setCurrentPage('home')} />
      )}
    </div>
  );
}

export default App;