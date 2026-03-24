import { useQuery } from "@tanstack/react-query";
import apiClient from "./apiClient";
import { Order, CreateOrderRequest } from "../types";

export const fetchOrders = async (pageNumber = 1, pageSize = 100): Promise<Order[]> => {
  const response = await apiClient.get(`Orders`, {
    params: { pageNumber, pageSize }
  });
  if (Array.isArray(response)) return response;
  if (response && typeof response === 'object' && Array.isArray((response as any).data)) return (response as any).data;
  if (response && typeof response === 'object' && Array.isArray((response as any).items)) return (response as any).items;
  return [];
};

export const fetchOrderById = async (id: number): Promise<Order> => {
  return apiClient.get(`Orders/${id}`);
};

export function useOrders(pageNumber = 1, pageSize = 100) {
  return useQuery<Order[]>({
    queryKey: ["orders", pageNumber, pageSize],
    queryFn: () => fetchOrders(pageNumber, pageSize),
    staleTime: 1000 * 60 * 5,
  });
}

export const createOrder = async (order: CreateOrderRequest): Promise<Order> => {
  return apiClient.post(`Orders`, order);
};

export const updateOrder = async (id: number, order: Partial<CreateOrderRequest>): Promise<Order> => {
  return apiClient.put(`Orders/${id}`, order);
};

export const deleteOrder = async (id: number): Promise<void> => {
  return apiClient.delete(`Orders/${id}`);
};
