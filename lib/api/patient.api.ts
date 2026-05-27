import { PopulatedPatient } from "@/@types/patient";
import { apiInstance } from "./api";

export const patientApi = {
  async getPatient(patientId: string): Promise<PopulatedPatient> {
    return (
      await apiInstance.get<{ data: PopulatedPatient }>(`/patient/${patientId}`)
    ).data.data;
  },
};
