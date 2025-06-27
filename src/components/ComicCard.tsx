import React from 'react';
import { Heart, Calendar, Star } from 'lucide-react';
import { Comic } from '../types';
import { StarRating } from './StarRating';

interface ComicCardProps {
  comic: Comic;
  onRead: (comic: Comic) => void;
  onToggleFavorite: (id: string) => void;
  onRatingChange: (id: string, rating: number) => void;
}

export const ComicCard: React.FC<ComicCardProps> = ({
  comic,
  onRead,
  onToggleFavorite,
  onRatingChange
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
      <div 
        className="aspect-[3/4] bg-gray-100 cursor-pointer overflow-hidden"
        onClick={() => onRead(comic)}
      >
        <img
          src={comic.coverImage}
          alt={comic.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <div className="p-4">
        <h3 
          className="font-bold text-lg text-gray-800 mb-2 line-clamp-2 cursor-pointer hover:text-orange-600 transition-colors"
          onClick={() => onRead(comic)}
        >
          {comic.title}
        </h3>
        
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <Calendar className="w-4 h-4 mr-1" />
          {new Date(comic.publishDate).toLocaleDateString('fr-FR')}
        </div>
        
        <div className="flex items-center justify-between">
          <StarRating
            rating={comic.rating}
            onRatingChange={(rating) => onRatingChange(comic.id, rating)}
            size="sm"
          />
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(comic.id);
            }}
            className={`p-2 rounded-full transition-all duration-200 ${
              comic.isFavorite
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600'
            }`}
          >
            <Heart 
              className={`w-5 h-5 ${comic.isFavorite ? 'fill-current' : ''}`} 
            />
          </button>
        </div>
      </div>
    </div>
  );
};