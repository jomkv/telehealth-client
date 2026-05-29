import { PopulatedPatient, UpdatePatientInput } from "@/@types/patient";
import { apiInstance } from "./api";
import { MeUser } from "@/@types/user";

export const patientApi = {
  async getPatient(patientId: string): Promise<PopulatedPatient> {
    return (
      await apiInstance.get<{ data: PopulatedPatient }>(`/patient/${patientId}`)
    ).data.data;
  },

  async updateMe(formData: UpdatePatientInput): Promise<MeUser> {
    return (await apiInstance.patch<{ data: MeUser }>("/patient/me", formData))
      .data.data;
  },
};
