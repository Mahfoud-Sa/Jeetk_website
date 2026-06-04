import apiClient from "./apiClient";

export interface WorkingDay {
  id?: number;
  userId: number;
  day: number; // 0 = Sunday, 1 = Monday, etc.
  fromTime: string; // e.g., "09:00"
  toTime: string; // e.g., "17:00"
}

export const fetchWorkingDays = async (userId: number): Promise<WorkingDay[]> => {
  try {
    // Try multiple standard patterns to fetch working days for the user
    // First, try GET working-days?userId={userId}
    const response = await apiClient.get(`working-days`, {
      params: { userId }
    });
    if (Array.isArray(response)) {
      return response.filter((item: any) => item.userId === userId);
    }
    if (response && typeof response === 'object') {
      const items = (response as any).data || (response as any).items || response;
      if (Array.isArray(items)) {
        return items.filter((item: any) => item.userId === userId);
      }
    }
  } catch (error) {
    console.warn("Failed fetching via generic list query, trying user-specific endpoint...", error);
    try {
      // Second, try GET working-days/user/{userId}
      const response = await apiClient.get(`working-days/user/${userId}`);
      if (Array.isArray(response)) return response;
      if (response && typeof response === 'object') {
        return (response as any).data || (response as any).items || [];
      }
    } catch (innerError) {
      console.error("Could not fetch working days from either endpoint:", innerError);
    }
  }
  return [];
};

const ensureSeconds = (timeStr: string): string => {
  if (!timeStr) return "00:00:00";
  const parts = timeStr.split(':');
  if (parts.length === 2) {
    return `${timeStr}:00`;
  }
  return timeStr;
};

export const createWorkingDay = async (workingDay: {
  userId: number;
  day: number;
  fromTime: string;
  toTime: string;
}): Promise<WorkingDay> => {
  const formatted = {
    ...workingDay,
    fromTime: ensureSeconds(workingDay.fromTime),
    toTime: ensureSeconds(workingDay.toTime)
  };
  return apiClient.post(`working-days`, formatted);
};

export const deleteWorkingDay = async (id: number): Promise<void> => {
  return apiClient.delete(`working-days/${id}`);
};
