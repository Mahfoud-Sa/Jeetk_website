export interface RouteLocation {
  id?: number;
  deliveryRouteId: number;
  name?: string;
  deliveryRoute?: {
    id: number;
    name: string;
    deliveryPrice: number;
  };
}

export interface Location {
  id: number;
  name: string;
  routeLocations: RouteLocation[];
}

export interface DeliveryRoute {
  id: number;
  name: string;
  deliveryPrice: number;
  isAvailable?: boolean;
  description?: string;
  locations?: LocationSimple[];
}

export interface LocationSimple {
  id: number;
  name: string;
}
