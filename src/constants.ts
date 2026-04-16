import { Restaurant, MenuItem, Location, DeliveryRoute } from './types';

export const RESTAURANTS: Restaurant[] = [
  {
    id: '1',
    name: 'The Golden Burger',
    category: 'Burgers',
    rating: 4.8,
    deliveryTime: '20-30 min',
    deliveryFee: 500,
    image: 'https://picsum.photos/seed/burger/800/600',
    description: 'Gourmet burgers made with 100% organic beef and secret sauces.'
  },
  {
    id: '2',
    name: 'Sushi Zen',
    category: 'Japanese',
    rating: 4.9,
    deliveryTime: '30-45 min',
    deliveryFee: 750,
    image: 'https://picsum.photos/seed/sushi/800/600',
    description: 'Fresh, authentic sushi and sashimi prepared by master chefs.'
  },
  {
    id: '3',
    name: 'Pasta Primavera',
    category: 'Italian',
    rating: 4.6,
    deliveryTime: '25-40 min',
    deliveryFee: 400,
    image: 'https://picsum.photos/seed/pasta/800/600',
    description: 'Traditional Italian pasta dishes with handmade noodles.'
  },
  {
    id: '4',
    name: 'Green Leaf Salads',
    category: 'Healthy',
    rating: 4.7,
    deliveryTime: '15-25 min',
    deliveryFee: 0,
    image: 'https://picsum.photos/seed/salad/800/600',
    description: 'Fresh, organic salads and cold-pressed juices for the health-conscious.'
  }
];

export const LOCATIONS: Location[] = [
  {
    id: 'l1',
    name: 'Berlin Mitte',
    image: 'https://picsum.photos/seed/berlin/800/600',
    googleMapsUrl: 'https://www.google.com/maps/place/Mitte,+Berlin,+Germany',
    address: 'Alexanderplatz 1, 10178 Berlin'
  },
  {
    id: 'l2',
    name: 'Prenzlauer Berg',
    image: 'https://picsum.photos/seed/prenzlauer/800/600',
    googleMapsUrl: 'https://www.google.com/maps/place/Prenzlauer+Berg,+Berlin,+Germany',
    address: 'Kastanienallee 1, 10435 Berlin'
  },
  {
    id: 'l3',
    name: 'Kreuzberg',
    image: 'https://picsum.photos/seed/kreuzberg/800/600',
    googleMapsUrl: 'https://www.google.com/maps/place/Kreuzberg,+Berlin,+Germany',
    address: 'Oranienstraße 1, 10997 Berlin'
  }
];

export const DELIVERY_ROUTES: DeliveryRoute[] = [
  { id: 'r1', origin: 'Berlin Mitte', destination: 'Prenzlauer Berg', distance: '3.5 km', price: 500, isAvailable: true },
  { id: 'r2', origin: 'Berlin Mitte', destination: 'Kreuzberg', distance: '4.2 km', price: 700, isAvailable: true },
  { id: 'r7', origin: 'Berlin Mitte', destination: 'Neukölln', distance: '5.1 km', price: 800, isAvailable: true },
  { id: 'r8', origin: 'Berlin Mitte', destination: 'Charlottenburg', distance: '6.5 km', price: 1000, isAvailable: true },
  { id: 'r3', origin: 'Prenzlauer Berg', destination: 'Berlin Mitte', distance: '3.5 km', price: 500, isAvailable: true },
  { id: 'r4', origin: 'Kreuzberg', destination: 'Berlin Mitte', distance: '4.2 km', price: 700, isAvailable: false },
  { id: 'r5', origin: 'Kreuzberg', destination: 'Prenzlauer Berg', distance: '6.8 km', price: 1200, isAvailable: true },
  { id: 'r6', origin: 'Prenzlauer Berg', destination: 'Kreuzberg', distance: '6.8 km', price: 1200, isAvailable: true },
];

export const MENU_ITEMS: Record<string, MenuItem[]> = {
  '1': [
    { id: 'm1', name: 'Classic Cheeseburger', description: 'Beef patty, cheddar, lettuce, tomato, onion', price: 2500, image: 'https://picsum.photos/seed/m1/400/300', category: 'Burgers' },
    { id: 'm2', name: 'Truffle Burger', description: 'Beef patty, truffle mayo, swiss cheese, mushrooms', price: 3500, image: 'https://picsum.photos/seed/m2/400/300', category: 'Burgers' },
    { id: 'm3', name: 'Sweet Potato Fries', description: 'Crispy sweet potato fries with spicy dip', price: 1200, image: 'https://picsum.photos/seed/m3/400/300', category: 'Sides' }
  ],
  '2': [
    { id: 'm4', name: 'Salmon Nigiri', description: 'Fresh salmon over seasoned rice (2pcs)', price: 1500, image: 'https://picsum.photos/seed/m4/400/300', category: 'Nigiri' },
    { id: 'm5', name: 'Dragon Roll', description: 'Shrimp tempura, eel, avocado, cucumber', price: 3000, image: 'https://picsum.photos/seed/m5/400/300', category: 'Rolls' }
  ]
};
