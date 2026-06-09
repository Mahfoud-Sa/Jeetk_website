import apiClient from "./apiClient";

export interface ServerRole {
  id: number;
  name: string;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string | null;
  deletedAt?: string | null;
  rolePermissions?: ServerRolePermission[];
}

export interface ServerRolePermission {
  roleId: number;
  permissionId: number;
  permission?: ServerPermission;
  role?: ServerRole;
}

export interface ServerPermission {
  id: number;
  code: string;
  description: string;
  rolePermissions?: ServerRolePermission[];
}

// 1. Roles Endpoints
export const getRoles = async (): Promise<ServerRole[]> => {
  try {
    const response = await apiClient.get("Roles", {
      ...({ skipGlobalError: true } as any)
    });
    if (Array.isArray(response)) return response;
    if (response && typeof response === "object" && Array.isArray((response as any).data)) return (response as any).data;
    return [];
  } catch (error) {
    console.warn("REST API check on Roles failed, returning static mockup database", error);
    return [
      { id: 1, name: "delivery", isDeleted: false },
      { id: 2, name: "admin", isDeleted: false },
      { id: 3, name: "customer", isDeleted: false }
    ];
  }
};

export const createRole = async (name: string): Promise<ServerRole> => {
  return apiClient.post("Roles", { name, isDeleted: false });
};

export const deleteRole = async (id: number): Promise<void> => {
  return apiClient.delete(`Roles/${id}`);
};

// 2. Permissions Endpoints
export const getPermissions = async (): Promise<ServerPermission[]> => {
  try {
    const response = await apiClient.get("Permissions", {
      ...({ skipGlobalError: true } as any)
    });
    if (Array.isArray(response)) return response;
    if (response && typeof response === "object" && Array.isArray((response as any).data)) return (response as any).data;
    return [];
  } catch (error) {
    console.warn("REST API check on Permissions failed, returning fallback defaults", error);
    return [
      { id: 1, code: "view_dashboard", description: "Access Dashboard and statistical summaries" },
      { id: 2, code: "manage_users", description: "Manage Users profiles and lifecycle settings" },
      { id: 3, code: "manage_roles", description: "Manage roles and privileges maps" },
      { id: 4, code: "manage_locations", description: "Manage Location boundaries and service parameters" },
      { id: 5, code: "manage_routes", description: "Manage delivery rates and logistics routes" },
      { id: 6, code: "manage_orders", description: "Manage orders tracking and live assignments" },
      { id: 7, code: "view_history", description: "Inspect system action trails and audit logs" }
    ];
  }
};

export const createPermission = async (code: string, description: string): Promise<ServerPermission> => {
  return apiClient.post("Permissions", { code, description });
};

export const deletePermission = async (id: number): Promise<void> => {
  return apiClient.delete(`Permissions/${id}`);
};

// 3. Assign Permission to Role
export const assignPermissionToRole = async (roleId: number, permissionId: number): Promise<any> => {
  return apiClient.post(`Roles/permissions/assign`, { roleId, permissionId });
};

// 4. Revoke Permission from Role
export const revokePermissionFromRole = async (roleId: number, permissionId: number): Promise<any> => {
  return apiClient.post(`Roles/permissions/revoke`, { roleId, permissionId });
};
