import {
  ConsultationView,
  CreateConsultationInput,
} from "@/@types/consultation";
import { apiInstance } from "./api";

export const consultationApi = {
  async createConsultation(formData: CreateConsultationInput) {
    await apiInstance.post(`/consultation`, formData);
  },

  async cancelConsultation(consultationId: string) {
    await apiInstance.patch(`/consultation/${consultationId}/cancel`);
  },

  async getConsultation(consultationId: string): Promise<ConsultationView> {
    return (
      await apiInstance.get<{ data: ConsultationView }>(
        `/consultation/${consultationId}`,
      )
    ).data.data;
  },

  async saveConsultationNotes(consultationId: string, doctorNotes: string) {
    return await apiInstance.patch(
      `/consultation/${consultationId}/doctor-notes`,
      {
        doctorNotes,
      },
    );
  },

  async reschedConsultation(consultationId: string, newSchedule: string) {
    return await apiInstance.patch(
      `/consultation/${consultationId}/reschedule`,
      {
        scheduledAt: newSchedule,
      },
    );
  },

  async getDoctorConsultations(): Promise<ConsultationView[]> {
    return (
      await apiInstance<{ data: ConsultationView[] }>("/consultation/doctor")
    ).data.data;
  },
};
