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
