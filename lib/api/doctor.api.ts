import { Specialization } from "@/@types/doctor";
import { apiInstance } from "./api";

export const doctorApi = {
  async getSpecializations(): Promise<Specialization[]> {
    return (
      await apiInstance.get<{ data: Specialization[] }>(
        "/doctor/specializations",
      )
    ).data.data;
  },
};
