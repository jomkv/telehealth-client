import { AvailabilityRow } from "./availability";
import { User } from "./user";

export interface Specialization {
  id: string;
  label: string;
  description: string;
  embedding?: float[];
}

export interface Doctor {
  id: string;
  userId: string;
  specializationId: string;
  bio?: string;
  yearsOfPractice?: number;
  specialization: Specialization;
}

export interface PopulatedDoctor extends Doctor {
  user: User;
}

export interface PopulatedDoctorWithAvailability extends PopulatedDoctor {
  availability: AvailabilityRow[];
  bookedSlots: string[];
}

export interface OnboardDoctorInput {
  specializationId: string;
  bio?: string;
  yearsOfPractice?: number;
}
