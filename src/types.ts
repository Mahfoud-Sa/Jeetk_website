export interface Restaurant {
  id: string;
  name: string;
  category: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  image: string;
  description: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export type OrderStatus = 'preparing' | 'on-the-way' | 'delivered';

export interface Location {
  id: string;
  name: string;
  image: string;
  googleMapsUrl: string;
  address: string;
}

export interface LocationRequest {
  id: string;
  name: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: Date;
}

export interface DeliveryRoute {
  id: string;
  origin: string;
  destination: string;
  distance: string;
  price: number;
  isAvailable: boolean;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  timestamp: Date;
}

export interface User {
  id: number;
  name: string;
  birthDate: string;
  email: string;
  password?: string;
  phoneNumber: string;
  address: string;
  username: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  role?: string;
}
