import { Restaurant } from "../types";
import { RESTAURANTS as DEFAULT_RESTAURANTS } from "../constants";

// Helper to initialize and retrieve localStorage items
const getLocalRestaurants = (): Restaurant[] => {
  if (typeof window === "undefined") return DEFAULT_RESTAURANTS;
  const stored = localStorage.getItem("jeetk_custom_restaurants_v1");
  if (!stored) {
    localStorage.setItem("jeetk_custom_restaurants_v1", JSON.stringify(DEFAULT_RESTAURANTS));
    return DEFAULT_RESTAURANTS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to parse local restaurants", e);
    return DEFAULT_RESTAURANTS;
  }
};

const saveLocalRestaurants = (restaurants: Restaurant[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("jeetk_custom_restaurants_v1", JSON.stringify(restaurants));
    
    // Also dispatch a custom event so other components can listen to changes dynamically
    window.dispatchEvent(new Event("jeetk_restaurants_updated"));
  }
};

export const getRestaurants = async (): Promise<Restaurant[]> => {
  // Always return the dynamic active list
  return getLocalRestaurants();
};

export const getRestaurantById = async (id: string): Promise<Restaurant | undefined> => {
  const list = getLocalRestaurants();
  return list.find(r => r.id === id);
};

export const createRestaurant = async (data: Omit<Restaurant, "id">): Promise<Restaurant> => {
  const list = getLocalRestaurants();
  const newId = String(Date.now());
  const newRestaurant: Restaurant = {
    ...data,
    id: newId,
    rating: data.rating || 4.5, // Default rating if none specified
  };
  
  const updated = [...list, newRestaurant];
  saveLocalRestaurants(updated);
  return newRestaurant;
};

export const updateRestaurant = async (id: string, data: Partial<Restaurant>): Promise<Restaurant> => {
  const list = getLocalRestaurants();
  const index = list.findIndex(r => r.id === id);
  if (index === -1) {
    throw new Error("Restaurant not found");
  }
  
  const updatedRestaurant = {
    ...list[index],
    ...data,
  };
  
  const updated = [...list];
  updated[index] = updatedRestaurant;
  saveLocalRestaurants(updated);
  return updatedRestaurant;
};

export const deleteRestaurant = async (id: string): Promise<void> => {
  const list = getLocalRestaurants();
  const updated = list.filter(r => r.id !== id);
  saveLocalRestaurants(updated);
};
