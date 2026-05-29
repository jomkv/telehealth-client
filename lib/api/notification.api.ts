import { Notification } from "@/@types/notification";
import { apiInstance } from "./api";

export const notificationApi = {
  async getLatest(): Promise<Notification[]> {
    return (
      await apiInstance.get<{ data: Notification[] }>(`/notification/latest`)
    ).data.data;
  },

  async getAll(): Promise<Notification[]> {
    return (await apiInstance.get<{ data: Notification[] }>(`/notification`))
      .data.data;
  },

  async markAllRead() {
    return await apiInstance.post(`/notification/mark-all-read`);
  },
};
