import { Doctor, PopulatedDoctor } from "./doctor";
import { Patient, PopulatedPatient } from "./patient";

export type ConsultationStatus = "PENDING" | "ONGOING" | "DONE" | "CANCELLED";

export interface Consultation {
  id: string;
  scheduledAt: string; // ISO 8601
  status: ConsultationStatus;
  patientId: string;
  doctorId: string;
  consultationId: string;
  patientNotes: string;
  doctorNotes?: string;
  meetingLink: string;
}

export interface ConsultationView extends Consultation {
  doctor: PopulatedDoctor;
  patient: PopulatedPatient;
}

export type CreateConsultationInput = Pick<
  Consultation,
  "doctorId" | "scheduledAt" | "patientNotes"
>;
