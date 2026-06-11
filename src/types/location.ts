export interface Location {
  id: number;
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  googlePlaceId?: string;
  notes?: string;
  googleMapsUrl?: string;
}

export interface LocationCreateInput {
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  googlePlaceId?: string;
  notes?: string;
}

export interface LocationUpdateInput {
  id?: number;
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  googlePlaceId?: string;
  notes?: string;
}

export interface LocationsPagedResponse {
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  data: Location[];
}

export interface GoogleMapsLinkResponse {
  url: string;
}
