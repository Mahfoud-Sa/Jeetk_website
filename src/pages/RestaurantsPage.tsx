import { useState } from 'react';
import { Search } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { RESTAURANTS } from '../constants';
import { RestaurantCard } from '../components/RestaurantCard';

export const RestaurantsPage = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRestaurants = RESTAURANTS.filter(res => 
    res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    res.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">{t.home.allRestaurants}</h1>
        <p className="text-zinc-500">Browse all restaurants available on Jeetk.</p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-12">
        <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder={t.home.searchPlaceholder}
          className="w-full ps-12 pe-4 py-4 bg-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all text-start"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredRestaurants.map(res => (
          <RestaurantCard key={res.id} restaurant={res} />
        ))}
      </div>

      {filteredRestaurants.length === 0 && (
        <div className="text-center py-20 bg-zinc-50 rounded-3xl">
          <p className="text-zinc-500">No restaurants found matching your search.</p>
        </div>
      )}
    </div>
  );
};
