import {
  PopulatedDoctor,
  PopulatedDoctorWithAvailability,
  Specialization,
  SymptomSearchResult,
  UpdateDoctorInput,
} from "@/@types/doctor";
import { apiInstance } from "./api";
import { UpdatePatientInput } from "@/@types/patient";
import { MeUser } from "@/@types/user";

export const doctorApi = {
  async getDoctor(
    doctorId: string,
    fromIso?: string,
    toIso?: string,
  ): Promise<PopulatedDoctorWithAvailability> {
    const params = fromIso && toIso ? { from: fromIso, to: toIso } : undefined;
    return (
      await apiInstance.get<{ data: PopulatedDoctorWithAvailability }>(
        `/doctor/${doctorId}`,
        { params },
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

  async searchSymptom(symptoms: string): Promise<SymptomSearchResult> {
    return (
      await apiInstance.get<{ data: SymptomSearchResult }>("/doctor/symptoms", {
        params: { symptoms },
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

  async updateMe(formData: UpdateDoctorInput): Promise<MeUser> {
    return (await apiInstance.patch<{ data: MeUser }>("/doctor/me", formData))
      .data.data;
  },
};
