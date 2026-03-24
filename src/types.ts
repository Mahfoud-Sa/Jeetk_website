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
  id: number;
  deliveryPrice: number;
  description: string;
  deliveryLocationDescription: string;
  orderState: string;
  receptionDescription: string;
  deliveryName: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrderRequest {
  deliveryPrice: number;
  description: string;
  deliveryLocationDescription: string;
  orderState: string;
  receptionDescription: string;
  deliveryName: string;
}

export interface PhoneNumber {
  id?: number;
  number: string;
  type: string;
}

export interface CreateUserRequest {
  fullName: string;
  role: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  birthDate: string;
  phoneNumbers: {
    number: string;
    type: string;
  }[];
}

export interface User {
  id: number;
  name?: string;
  fullName?: string;
  profilePictureUrl?: string | null;
  birthDate: string;
  email: string;
  password?: string;
  phoneNumber?: string;
  address?: string | null;
  username?: string;
  isActive: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string | null;
  deletedAt?: string | null;
  role?: string;
  roles?: string[];
  userRoles?: any[];
  userPermissions?: any[];
  phoneNumbers: PhoneNumber[] | null;
}
