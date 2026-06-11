import { Restaurant } from "../types";
import apiClient from "./apiClient";

// A clean mapping utility to turn any API response object safely into a compliant Frontend Restaurant
export const mapApiRestaurant = (raw: any): Restaurant => {
  const name = raw.name || "Unnamed Restaurant";
  const rawId = raw.id;
  
  // Calculate a reliable numeric index for stable pseudorandom category selection
  const numId = typeof rawId === "number" ? rawId : parseInt(String(rawId).replace(/\D/g, ""), 10) || 123;
  
  const categoriesList = ['Burgers', 'Japanese', 'Italian', 'Healthy', 'Pizza', 'Desserts', 'Arabic', 'Indian'];
  const category = raw.category || categoriesList[numId % categoriesList.length];
  
  const slug = name.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-');
  
  return {
    id: String(rawId),
    name: name,
    description: raw.description || "مطعم ممتاز وذو تقييم عالي يقدم أشهى المأكولات وأفضل الخدمات.",
    category: category,
    rating: Number(raw.rating) || parseFloat((4.0 + (numId % 10) / 10).toFixed(1)) || 4.5,
    deliveryTime: raw.deliveryTime || `${15 + (numId % 4) * 5}-${25 + (numId % 4) * 5} min`,
    deliveryFee: raw.deliveryFee !== undefined ? Number(raw.deliveryFee) : (250 + (numId % 6) * 50),
    image: raw.image || `https://picsum.photos/seed/${slug || rawId}/800/600`,
  };
};

export interface PaginatedRestaurantsResponse {
  items: Restaurant[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// GET all list (used on maps, frontend customer home page, etc.)
export const getRestaurants = async (page = 1, pageSize = 50): Promise<Restaurant[]> => {
  try {
    const response: any = await apiClient.get("Restaurants", {
      params: { pageNumber: page, pageSize: pageSize },
      headers: { 'x-skip-global-error': 'true' }
    } as any);

    let rawItems: any[] = [];
    if (response) {
      if (Array.isArray(response)) {
        rawItems = response;
      } else if (Array.isArray(response.data)) {
        rawItems = response.data;
      } else if (Array.isArray(response.items)) {
        rawItems = response.items;
      }
    }

    if (rawItems && rawItems.length > 0) {
      return rawItems.map(mapApiRestaurant);
    }
    return [];
  } catch (error) {
    console.warn("Failed to fetch restaurants list from API, returning empty array", error);
    return [];
  }
};

export const getRestaurantById = async (id: string): Promise<Restaurant | undefined> => {
  try {
    // Check if we can fetch all and find the matching ID (some server APIs might not have clear GET /Restaurants/{id} or require exact parameter mapping)
    const list = await getRestaurants(1, 100);
    const found = list.find(r => r.id === id);
    if (found) return found;

    // Fallback: Fetch directly
    const response: any = await apiClient.get(`Restaurants/${id}`, {
      headers: { 'x-skip-global-error': 'true' }
    } as any);
    if (response) {
      return mapApiRestaurant(response);
    }
    return undefined;
  } catch (error) {
    console.warn(`Failed to fetch restaurant with id ${id}`, error);
    return undefined;
  }
};

// GET with support for standard Paginated Querying, Search Term & Category filters
export const getRestaurantsPaged = async (
  page = 1,
  pageSize = 10,
  searchTerm = "",
  categoryFilter = "all"
): Promise<PaginatedRestaurantsResponse> => {
  try {
    const response: any = await apiClient.get("Restaurants", {
      params: { pageNumber: page, pageSize: pageSize },
      headers: { 'x-skip-global-error': 'true' }
    } as any);

    let rawItems: any[] = [];
    let totalItems = 0;
    let totalPages = 1;

    if (response) {
      if (Array.isArray(response)) {
        rawItems = response;
        totalItems = response.length;
        totalPages = Math.ceil(totalItems / pageSize) || 1;
      } else {
        rawItems = Array.isArray(response.data) ? response.data : Array.isArray(response.items) ? response.items : [];
        totalItems = response.totalRecords || response.totalItems || rawItems.length;
        totalPages = response.totalPages || Math.ceil(totalItems / pageSize) || 1;
      }
    }

    // Map each to a standard Frontend Restaurant
    let mapped = rawItems.map(mapApiRestaurant);

    // Filter server response with searching and categories client-side to ensure seamless, real-time filtering if the server pagination API doesn't support nested search
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      mapped = mapped.filter(r => 
        r.name.toLowerCase().includes(q) || 
        r.description.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
      );
    }

    if (categoryFilter && categoryFilter !== "all") {
      mapped = mapped.filter(r => r.category === categoryFilter);
    }

    return {
      items: mapped,
      totalItems: totalItems,
      page: page,
      pageSize: pageSize,
      totalPages: totalPages
    };
  } catch (error) {
    console.warn("getRestaurantsPaged fails, returning empty structures:", error);
    return {
      items: [],
      totalItems: 0,
      page: page,
      pageSize: pageSize,
      totalPages: 1
    };
  }
};

// POST real data
export const createRestaurant = async (data: Omit<Restaurant, "id">): Promise<Restaurant> => {
  try {
    const response: any = await apiClient.post("Restaurants", {
      name: data.name,
      description: data.description,
    });
    
    // Trigger custom event to notify listening layers that the database state updated!
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("jeetk_restaurants_updated"));
    }
    
    return mapApiRestaurant(response || data);
  } catch (error) {
    console.error("Failed to post new restaurant:", error);
    throw error;
  }
};

// PUT real data (Update)
export const updateRestaurant = async (id: string, data: Partial<Restaurant>): Promise<Restaurant> => {
  try {
    const response: any = await apiClient.put(`Restaurants/${id}`, {
      id: Number(id) || id,
      name: data.name,
      description: data.description,
    });

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("jeetk_restaurants_updated"));
    }

    return mapApiRestaurant(response || data);
  } catch (error) {
    console.error(`Failed to update restaurant ${id}:`, error);
    throw error;
  }
};

// DELETE real data
export const deleteRestaurant = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`Restaurants/${id}`);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("jeetk_restaurants_updated"));
    }
  } catch (error) {
    console.error(`Failed to delete restaurant ${id}:`, error);
    throw error;
  }
};
