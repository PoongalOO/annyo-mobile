import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Heart } from 'lucide-react';
import { Comic } from '../types';
import { getComics, updateComic } from '../utils/storage';
import { ComicCard } from '../components/ComicCard';
import { AddComicModal } from '../components/AddComicModal';
import { ComicReader } from '../components/ComicReader';
import { addComic } from '../utils/storage';
import { createCoverImage } from '../utils/imageProcessor';

interface HomePageProps {
  onNavigateToFavorites: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigateToFavorites }) => {
  const [comics, setComics] = useState<Comic[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedComic, setSelectedComic] = useState<Comic | null>(null);

  useEffect(() => {
    loadComics();
  }, []);

  const loadComics = () => {
    const storedComics = getComics();
    setComics(storedComics);
  };

  const handleAddComic = (title: string, panels: string[], publishDate: string) => {
    const coverImage = createCoverImage(panels);
    
    const newComic = addComic({
      title,
      panels,
      publishDate,
      coverImage,
      isFavorite: false,
      rating: 0,
      createdAt: new Date().toISOString()
    });
    
    setComics(prev => [newComic, ...prev]);
  };

  const handleToggleFavorite = (id: string) => {
    const comic = comics.find(c => c.id === id);
    if (comic) {
      const newFavoriteStatus = !comic.isFavorite;
      updateComic(id, { isFavorite: newFavoriteStatus });
      setComics(prev =>
        prev.map(c => c.id === id ? { ...c, isFavorite: newFavoriteStatus } : c)
      );
      
      if (selectedComic?.id === id) {
        setSelectedComic(prev => prev ? { ...prev, isFavorite: newFavoriteStatus } : null);
      }
    }
  };

  const handleRatingChange = (id: string, rating: number) => {
    updateComic(id, { rating });
    setComics(prev =>
      prev.map(c => c.id === id ? { ...c, rating } : c)
    );
    
    if (selectedComic?.id === id) {
      setSelectedComic(prev => prev ? { ...prev, rating } : null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-orange-500" />
              <h1 className="text-3xl font-bold text-gray-900">Comic Reader</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={onNavigateToFavorites}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-orange-600 transition-colors"
              >
                <Heart className="w-5 h-5" />
                Favoris
              </button>
              
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-md hover:shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Ajouter une BD
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {comics.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">
              Aucune BD pour le moment
            </h2>
            <p className="text-gray-500 mb-6">
              Commencez par ajouter votre première bande dessinée
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Ajouter une BD
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {comics.map((comic) => (
              <ComicCard
                key={comic.id}
                comic={comic}
                onRead={setSelectedComic}
                onToggleFavorite={handleToggleFavorite}
                onRatingChange={handleRatingChange}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <AddComicModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddComic={handleAddComic}
      />

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