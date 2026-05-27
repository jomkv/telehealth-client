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
