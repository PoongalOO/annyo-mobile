import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Heart, Home } from 'lucide-react';
import { Comic } from '../types';
import { StarRating } from './StarRating';

interface ComicReaderProps {
  comic: Comic;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onRatingChange: (id: string, rating: number) => void;
}

export const ComicReader: React.FC<ComicReaderProps> = ({
  comic,
  onClose,
  onToggleFavorite,
  onRatingChange
}) => {
  const [currentPanel, setCurrentPanel] = useState(0);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') previousPanel();
      if (e.key === 'ArrowRight') nextPanel();
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPanel]);

  const nextPanel = () => {
    if (currentPanel < comic.panels.length - 1) {
      setCurrentPanel(currentPanel + 1);
    }
  };

  const previousPanel = () => {
    if (currentPanel > 0) {
      setCurrentPanel(currentPanel - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-md p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">{comic.title}</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <StarRating
            rating={comic.rating}
            onRatingChange={(rating) => onRatingChange(comic.id, rating)}
          />
          <button
            onClick={() => onToggleFavorite(comic.id)}
            className={`p-2 rounded-full transition-all duration-200 ${
              comic.isFavorite
                ? 'bg-red-100 text-red-600'
                : 'bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600'
            }`}
          >
            <Heart className={`w-6 h-6 ${comic.isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Reader */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative max-w-4xl w-full">
          <img
            src={comic.panels[currentPanel]}
            alt={`Panel ${currentPanel + 1}`}
            className="w-full h-auto max-h-[80vh] object-contain rounded-lg shadow-2xl"
          />
          
          {/* Navigation buttons */}
          <button
            onClick={previousPanel}
            disabled={currentPanel === 0}
            className={`absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full shadow-lg transition-all duration-200 ${
              currentPanel === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-white text-gray-800 hover:bg-gray-100 hover:scale-110'
            }`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={nextPanel}
            disabled={currentPanel === comic.panels.length - 1}
            className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full shadow-lg transition-all duration-200 ${
              currentPanel === comic.panels.length - 1
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-white text-gray-800 hover:bg-gray-100 hover:scale-110'
            }`}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="bg-white p-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-sm text-gray-600">
            Vignette {currentPanel + 1} sur {comic.panels.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentPanel + 1) / comic.panels.length) * 100}%` }}
          />
        </div>
        
        {/* Panel thumbnails */}
        <div className="flex justify-center gap-2 mt-4 overflow-x-auto">
          {comic.panels.map((panel, index) => (
            <button
              key={index}
              onClick={() => setCurrentPanel(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all duration-200 ${
                index === currentPanel
                  ? 'border-orange-500 shadow-lg scale-110'
                  : 'border-gray-300 hover:border-orange-300'
              }`}
            >
              <img
                src={panel}
                alt={`Panel ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};