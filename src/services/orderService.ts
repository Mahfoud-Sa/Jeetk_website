import { useQuery } from "@tanstack/react-query";
import apiClient from "./apiClient";
import { Order, CreateOrderRequest, ActionEntity } from "../types";

export const fetchOrders = async (page = 1, pageSize = 100): Promise<Order[]> => {
  const response = await apiClient.get(`Orders`, {
    params: { page, pageSize }
  });
  if (Array.isArray(response)) return response;
  if (response && typeof response === 'object' && Array.isArray((response as any).data)) return (response as any).data;
  if (response && typeof response === 'object' && Array.isArray((response as any).items)) return (response as any).items;
  return [];
};

export const fetchOrderById = async (id: number): Promise<Order> => {
  return apiClient.get(`Orders/${id}`);
};

export const fetchOrderHistory = async (id: number): Promise<ActionEntity[]> => {
  const response = await apiClient.get(`Actions/entity`, {
    params: { 
      entityName: 'OrderEntity',
      entityId: id,
      page: 1, 
      pageSize: 100
    }
  });
  if (Array.isArray(response)) return response;
  if (response && typeof response === 'object' && Array.isArray((response as any).data)) return (response as any).data;
  if (response && typeof response === 'object' && Array.isArray((response as any).items)) return (response as any).items;
  return [];
};

export function useOrders(page = 1, pageSize = 100, userId?: number | null) {
  return useQuery<Order[]>({
    queryKey: ["orders", page, pageSize, userId],
    queryFn: () => fetchOrders(page, pageSize),
    staleTime: 1000 * 60 * 5,
  });
}

export function useOrderHistory(id: number | null) {
  return useQuery<ActionEntity[]>({
    queryKey: ["orderHistory", id],
    queryFn: () => id ? fetchOrderHistory(id) : Promise.resolve([]),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}

export const createOrder = async (order: CreateOrderRequest): Promise<Order> => {
  return apiClient.post(`Orders`, order);
};

export const updateOrder = async (id: number, order: Partial<CreateOrderRequest>): Promise<Order> => {
  return apiClient.put(`Orders/${id}`, order);
};

export const updateOrderState = async (id: number, newState: string): Promise<void> => {
  return apiClient.put(`Orders/${id}/update-state`, { newState });
};

export const deleteOrder = async (id: number): Promise<void> => {
  return apiClient.delete(`Orders/${id}`);
};
