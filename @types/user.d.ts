import { Doctor } from "./doctor";
import { Patient } from "./patient";

export type Role = "PATIENT" | "DOCTOR";

export interface FullUser {
  id: string;
  email: string;
  password: string;
  name: string;
  birthday: string; // datetime string
  profilePic?: string;
  mobileNumber: string;
  role: Role;
  isOnboarded: boolean;
  createdAt: string; // datetime string
}

export type User = Omit<FullUser, "password">;

export interface MeUser extends User {
  patient?: Patient;
  doctor?: Doctor;
}

export type CreateUserInput = Omit<
  FullUser,
  "id" | "profilePic" | "isOnboarded" | "createdAt"
>;

export type LoginInput = Pick<FullUser, "email" | "password">;

export interface UpdateUserInput {
  password?: string;
  name?: string;
  birthday?: string; // datetime string
  profilePic?: File; // -> File, must be image only, max 1, idk what type this should be, BE expects multiform
  mobileNumber?: string;
}
