import { CreateUserInput, LoginInput } from "@/@types/user";
import { apiInstance } from "./api";

export const userApi = {
  async signup(formData: CreateUserInput) {
    return await apiInstance.post("/user", formData);
  },

  async login(formData: LoginInput) {
    return await apiInstance.post("/auth/login", formData);
  },

  async logout() {
    return await apiInstance.post("/auth/logout");
  },
};
