import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Restaurant } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export const RestaurantCard: FC<RestaurantCardProps> = ({ restaurant }) => {
  const { t, language } = useLanguage();
  return (
    <Link to={`/restaurant/${restaurant.id}`} className="group">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl mb-3">
        <img 
          src={restaurant.image} 
          alt={restaurant.name}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          {restaurant.rating}
        </div>
      </div>
      <div className="flex justify-between items-start">
        <div className="text-start">
          <h3 className="font-semibold text-lg">{restaurant.name}</h3>
          <p className="text-zinc-500 text-sm">{restaurant.category} • {restaurant.deliveryTime}</p>
        </div>
        <div className="text-end">
          <p className="text-sm font-medium">{restaurant.deliveryFee === 0 ? t.home.freeDelivery : `${restaurant.deliveryFee} ${language === 'ar' ? 'ر.ي' : 'YER'} ${t.home.deliveryFee}`}</p>
        </div>
      </div>
    </Link>
  );
};
