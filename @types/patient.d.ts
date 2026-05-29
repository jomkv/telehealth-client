import { User } from "./user";

export interface Patient {
  id: string;
  userId: string;
  weight: number;
  height: number;
  conditions: string[];
  allergies: string[];
  medications: string[];
  notes?: string;
}

export interface PopulatedPatient extends Patient {
  user: User;
}

export interface OnboardPatientInput {
  weight: number;
  height: number;
  conditions?: string[];
  allergies?: string[];
  medications?: string[];
  notes?: string;
}

export type UpdatePatientInput = OnboardPatientInput;
