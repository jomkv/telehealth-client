import { OnboardDoctorInput } from "@/@types/doctor";
import { OnboardPatientInput } from "@/@types/patient";
import {
  CreateUserInput,
  LoginInput,
  MeUser,
  UpdateUserInput,
} from "@/@types/user";
import { apiInstance } from "./api";

export const userApi = {
  async signup(formData: CreateUserInput) {
    return await apiInstance.post("/user", formData);
  },

  async login(formData: LoginInput): Promise<MeUser> {
    return (await apiInstance.post<{ data: MeUser }>("/auth/login", formData))
      .data.data;
  },

  async logout() {
    return await apiInstance.post("/auth/logout");
  },

  async onboardPatient(formData: OnboardPatientInput): Promise<MeUser> {
    return (
      await apiInstance.post<{ data: MeUser }>("/user/onboard", {
        patient: formData,
      })
    ).data.data;
  },

  async onboardDoctor(formData: OnboardDoctorInput): Promise<MeUser> {
    return (
      await apiInstance.post<{ data: MeUser }>("/user/onboard", {
        doctor: formData,
      })
    ).data.data;
  },

  async updateMe(formData: UpdateUserInput): Promise<MeUser> {
    return (
      await apiInstance.patch<{ data: MeUser }>("/user/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ).data.data;
  },
};
