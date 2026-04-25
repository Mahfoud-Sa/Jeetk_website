import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Clock, ShoppingBag, Plus } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { RESTAURANTS, MENU_ITEMS } from '../constants';
import { MenuItem } from '../types';

export const RestaurantPage = ({ addToCart }: { addToCart: (item: MenuItem) => void }) => {
  const { id } = useParams();
  const { language } = useLanguage();
  const restaurant = RESTAURANTS.find(r => r.id === id);
  const menu = MENU_ITEMS[id || ''] || [];

  if (!restaurant) return <div className="p-20 text-center font-bold">Restaurant not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-black mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to restaurants
      </Link>

      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="w-full md:w-1/2 rounded-3xl overflow-hidden aspect-video">
          <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
        <div className="w-full md:w-1/2 flex flex-col justify-center text-start">
          <h1 className="text-4xl font-bold mb-2">{restaurant.name}</h1>
          <p className="text-zinc-500 mb-4">{restaurant.description}</p>
          <div className="flex items-center gap-6 text-sm font-medium">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              {restaurant.rating} (500+ ratings)
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {restaurant.deliveryTime}
            </div>
            <div className="flex items-center gap-1">
              <ShoppingBag className="w-4 h-4" />
              {restaurant.deliveryFee === 0 ? 'Free Delivery' : `${restaurant.deliveryFee} ${language === 'ar' ? 'ر.ي' : 'YER'} Delivery`}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {menu.map(item => (
          <div key={item.id} className="bg-white border border-zinc-100 p-4 rounded-2xl flex gap-4 hover:shadow-md transition-shadow text-start">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
              <p className="text-zinc-500 text-sm mb-3 line-clamp-2">{item.description}</p>
              <div className="flex items-center justify-between">
                <span className="font-bold">{item.price} {language === 'ar' ? 'ر.ي' : 'YER'}</span>
                <button 
                  onClick={() => addToCart(item)}
                  className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
