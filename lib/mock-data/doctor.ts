import { DoctorCardDoctor } from "@/components/cards/doctor-card";

export const DOCTORS: DoctorCardDoctor[] = [
  {
    id: "doc-1",
    specializationId: "spec-1",
    yearsOfPractice: 14,
    bio: "Specializing in interventional cardiology and preventive heart care. Board-certified with extensive clinical trial experience.",
    user: { name: "Dr. Maria Santos" },
    specialization: { label: "Cardiology" },
  },
  {
    id: "doc-2",
    specializationId: "spec-2",
    yearsOfPractice: 9,
    bio: "Focused on medical and cosmetic dermatology. Experienced in treating acne, eczema, psoriasis, and early-stage skin lesions.",
    user: { name: "Dr. James Reyes" },
    specialization: { label: "Dermatology" },
  },
  {
    id: "doc-3",
    specializationId: "spec-3",
    yearsOfPractice: 17,
    bio: "Subspecialized in epilepsy and movement disorders. Trained at the University of the Philippines - Philippine General Hospital.",
    user: { name: "Dr. Ana Villanueva" },
    specialization: { label: "Neurology" },
  },
  {
    id: "doc-4",
    specializationId: "spec-4",
    yearsOfPractice: 11,
    bio: "Sports medicine and joint reconstruction. Official physician for two national athletic programs.",
    user: { name: "Dr. Kevin Cruz" },
    specialization: { label: "Orthopedics" },
  },
  {
    id: "doc-5",
    specializationId: "spec-5",
    yearsOfPractice: 6,
    bio: "Comprehensive primary care with a focus on chronic disease management and family health.",
    user: { name: "Dr. Rachel Tan" },
    specialization: { label: "General Practice" },
  },
  {
    id: "doc-6",
    specializationId: "spec-1",
    yearsOfPractice: 22,
    bio: "Senior cardiologist with expertise in echocardiography and advanced heart failure management.",
    user: { name: "Dr. Roberto Lim" },
    specialization: { label: "Cardiology" },
  },
];
