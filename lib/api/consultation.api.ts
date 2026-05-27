import {
  ConsultationView,
  CreateConsultationInput,
} from "@/@types/consultation";
import { apiInstance } from "./api";
import { AvailabilityRow } from "@/@types/availability";

export const consultationApi = {
  async createConsultation(formData: CreateConsultationInput) {
    await apiInstance.post(`/consultation`, formData);
  },

  async getDoctorConsultations(): Promise<ConsultationView[]> {
    return (
      await apiInstance<{ data: ConsultationView[] }>("/consultation/doctor")
    ).data.data;
  },
};
