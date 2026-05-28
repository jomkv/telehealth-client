import {
  PopulatedDoctor,
  PopulatedDoctorWithAvailability,
  Specialization,
} from "@/@types/doctor";
import { apiInstance } from "./api";

export const doctorApi = {
  async getDoctor(doctorId: string): Promise<PopulatedDoctorWithAvailability> {
    return (
      await apiInstance.get<{ data: PopulatedDoctorWithAvailability }>(
        `/doctor/${doctorId}`,
      )
    ).data.data;
  },

  async searchDoctors(query: string): Promise<PopulatedDoctor[]> {
    const trimmed = query.trim();
    return (
      await apiInstance.get<{ data: PopulatedDoctor[] }>("/doctor", {
        params: { q: trimmed.length > 0 ? trimmed : undefined },
      })
    ).data.data;
  },

  async getSpecializations(): Promise<Specialization[]> {
    return (
      await apiInstance.get<{ data: Specialization[] }>(
        "/doctor/specializations",
      )
    ).data.data;
  },
};
