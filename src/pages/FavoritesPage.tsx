import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, BookOpen, Trash2 } from 'lucide-react';
import { Comic } from '../types';
import { getFavoriteComics, updateComic, deleteComic } from '../utils/storage';
import { ComicCard } from '../components/ComicCard';
import { ComicReader } from '../components/ComicReader';

interface FavoritesPageProps {
  onNavigateHome: () => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({ onNavigateHome }) => {
  const [favorites, setFavorites] = useState<Comic[]>([]);
  const [selectedComic, setSelectedComic] = useState<Comic | null>(null);
  const [sortBy, setSortBy] = useState<'title' | 'rating' | 'date'>('title');

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    const favoriteComics = getFavoriteComics();
    setFavorites(favoriteComics);
  };

  const sortedFavorites = [...favorites].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'date':
        return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
      default:
        return a.title.localeCompare(b.title);
    }
  });

  const handleToggleFavorite = (id: string) => {
    updateComic(id, { isFavorite: false });
    setFavorites(prev => prev.filter(c => c.id !== id));
    
    if (selectedComic?.id === id) {
      setSelectedComic(null);
    }
  };

  const handleRatingChange = (id: string, rating: number) => {
    updateComic(id, { rating });
    setFavorites(prev =>
      prev.map(c => c.id === id ? { ...c, rating } : c)
    );
    
    if (selectedComic?.id === id) {
      setSelectedComic(prev => prev ? { ...prev, rating } : null);
    }
  };

  const handleDeleteComic = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette BD ?')) {
      deleteComic(id);
      setFavorites(prev => prev.filter(c => c.id !== id));
      
      if (selectedComic?.id === id) {
        setSelectedComic(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onNavigateHome}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              
              <div className="flex items-center gap-3">
                <Heart className="w-8 h-8 text-red-500 fill-current" />
                <h1 className="text-3xl font-bold text-gray-900">Mes Favoris</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {favorites.length} BD{favorites.length > 1 ? 's' : ''} favori{favorites.length > 1 ? 'tes' : 'te'}
              </span>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'title' | 'rating' | 'date')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="title">Trier par titre</option>
                <option value="rating">Trier par note</option>
                <option value="date">Trier par date</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">
              Aucune BD favorite
            </h2>
            <p className="text-gray-500 mb-6">
              Ajoutez des BD à vos favoris en cliquant sur le cœur
            </p>
            <button
              onClick={onNavigateHome}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Parcourir les BD
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {sortedFavorites.map((comic) => (
              <div key={comic.id} className="relative group">
                <ComicCard
                  comic={comic}
                  onRead={setSelectedComic}
                  onToggleFavorite={handleToggleFavorite}
                  onRatingChange={handleRatingChange}
                />
                
                <button
                  onClick={() => handleDeleteComic(comic.id)}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 shadow-lg"
                  title="Supprimer cette BD"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Comic Reader */}
      {selectedComic && (
        <ComicReader
          comic={selectedComic}
          onClose={() => setSelectedComic(null)}
          onToggleFavorite={handleToggleFavorite}
          onRatingChange={handleRatingChange}
        />
      )}
    </div>
  );
};