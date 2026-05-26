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

export type CreateUserInput = Omit<
  FullUser,
  "id" | "profilePic" | "isOnboarded" | "createdAt"
>;

export type LoginInput = Pick<FullUser, "email" | "password">;
