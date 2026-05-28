import { CreateUserInput, LoginInput, MeUser } from "@/@types/user";
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
};
