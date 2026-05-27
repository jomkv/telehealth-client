import { apiInstance } from "./api";
import { AvailabilityRow } from "@/@types/availability";

export const availabilityApi = {
  async getAvailabilityTemplate(doctorId: string): Promise<AvailabilityRow[]> {
    return (
      await apiInstance.get<{ data: AvailabilityRow[] }>(
        `/availability/${doctorId}`,
      )
    ).data.data;
  },

  async updatedAvailabilityTemplate(rows: AvailabilityRow[]) {
    return await apiInstance.put("/availability", { availability: rows });
  },
};
