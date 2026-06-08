import { useQuery } from "@tanstack/react-query";
import apiClient from "./apiClient";
import { User, CreateUserRequest } from "../types";

export const fetchUsers = async (page = 1, pageSize = 10, sort = 'asc'): Promise<User[]> => {
  try {
    const response = await apiClient.get(`Users`, {
      params: { page, pageSize, sort },
      ...({ skipGlobalError: true } as any)
    });
    if (Array.isArray(response)) return response;
    if (response && typeof response === 'object' && Array.isArray((response as any).data)) return (response as any).data;
    if (response && typeof response === 'object' && Array.isArray((response as any).items)) return (response as any).items;
    return [];
  } catch (error) {
    console.warn("fetchUsers query failed, trying standard fallback without custom parameters...", error);
    try {
      const response = await apiClient.get(`Users`, {
        ...({ skipGlobalError: true } as any)
      });
      if (Array.isArray(response)) return response;
      if (response && typeof response === 'object' && Array.isArray((response as any).data)) return (response as any).data;
      if (response && typeof response === 'object' && Array.isArray((response as any).items)) return (response as any).items;
    } catch (fallbackError) {
      console.warn("fetchUsers fallback standard query also failed:", fallbackError);
    }
    return [];
  }
};

export interface PaginatedUsersResponse {
  items: User[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const fetchUsersPaged = async (
  page = 1,
  pageSize = 10,
  searchTerm = "",
  roleFilter = "all",
  statusFilter = "all",
  sort = "asc"
): Promise<PaginatedUsersResponse> => {
  try {
    const params: any = { page, pageSize, sort };
    if (searchTerm) params.search = searchTerm;
    if (roleFilter && roleFilter !== 'all') params.role = roleFilter;
    if (statusFilter && statusFilter !== 'all') params.status = statusFilter;

    const response = await apiClient.get(`Users`, {
      params,
      ...({ skipGlobalError: true } as any)
    });

    if (response && typeof response === 'object') {
      const items = Array.isArray((response as any).items) 
        ? (response as any).items 
        : Array.isArray((response as any).data)
          ? (response as any).data
          : Array.isArray(response)
            ? response
            : [];
      const totalItems = typeof (response as any).totalItems === 'number'
        ? (response as any).totalItems
        : items.length;
      const totalPages = typeof (response as any).totalPages === 'number'
        ? (response as any).totalPages
        : Math.ceil(totalItems / pageSize);

      return {
        items,
        totalItems,
        page: (response as any).page || page,
        pageSize: (response as any).pageSize || pageSize,
        totalPages
      };
    }

    const arr = Array.isArray(response) ? response : [];
    return {
      items: arr,
      totalItems: arr.length,
      page,
      pageSize,
      totalPages: Math.ceil(arr.length / pageSize)
    };
  } catch (error) {
    console.warn("fetchUsersPaged query failed, falling back to basic array fetch...", error);
    const fallbackArr = await fetchUsers(1, 1000);
    let filtered = [...fallbackArr];
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(u => 
        (u.name || u.fullName || '').toLowerCase().includes(query) || 
        (u.email || '').toLowerCase().includes(query)
      );
    }
    if (roleFilter && roleFilter !== 'all') {
      filtered = filtered.filter(u => {
        const uRole = u.role || (u.roles && u.roles[0]) || 'customer';
        return uRole === roleFilter;
      });
    }
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(u => {
        const uStatus = u.isActive ? 'active' : 'inactive';
        return uStatus === statusFilter;
      });
    }
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = filtered.slice(startIndex, startIndex + pageSize);

    return {
      items: paginatedItems,
      totalItems: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize)
    };
  }
};

export const fetchUserById = async (id: number): Promise<User> => {
  try {
    return await apiClient.get(`Users/${id}`);
  } catch (error) {
    console.warn(`fetchUserById for ${id} failed:`, error);
    throw error;
  }
};

export function useUsers(page = 1, pageSize = 100, sort = 'asc') {
  return useQuery<User[]>({
    queryKey: ["users", page, pageSize, sort],
    queryFn: () => fetchUsers(page, pageSize, sort),
    staleTime: 1000 * 60 * 5,
  });
}

export function useUser(id: number | null) {
  return useQuery<User>({
    queryKey: ["user", id],
    queryFn: () => fetchUserById(id!),
    enabled: !!id,
  });
}

export const createUser = async (user: CreateUserRequest | Partial<User>): Promise<User> => {
  return apiClient.post(`Users`, user);
};

export const updateUser = async (id: number, user: Partial<User>): Promise<User> => {
  return apiClient.put(`Users/${id}`, user);
};

export const deleteUser = async (id: number): Promise<void> => {
  return apiClient.delete(`Users/${id}`);
};

export const activateUser = async (id: number): Promise<any> => {
  return apiClient.put(`Users/${id}/activate`);
};

export const deactivateUser = async (id: number): Promise<any> => {
  return apiClient.put(`Users/${id}/deactivate`);
};

export const adminResetUserPassword = async (id: number, newPassword: string): Promise<any> => {
  return apiClient.put(`Users/${id}/reset-password`, { newPassword, password: newPassword, confirmedPassword: newPassword });
};

export const verifyUserAccount = async (id: number): Promise<any> => {
  return apiClient.put(`Users/${id}/verify-account`);
};

export const changePassword = async (confirmedPassword: string, newPassword: string): Promise<any> => {
  return apiClient.post(`Profile/change-password`, { confirmedPassword, newPassword });
};
