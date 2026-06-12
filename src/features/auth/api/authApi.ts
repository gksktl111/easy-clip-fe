import { AuthProvider } from "@/features/auth/model/auth";
import {
  LogoutResponseDto,
  UserProfileResponseDto,
} from "@/features/auth/model/auth.dto";
import { apiRequest } from "@/shared/lib/apiClient";

export const getAuthStartPath = (provider: AuthProvider) => `/auth/${provider}`;

export const fetchMyProfile = async (accessToken: string) =>
  apiRequest<UserProfileResponseDto>("/users/me", {
    accessToken,
    cache: "no-store",
  });

export const logout = async (accessToken: string) =>
  apiRequest<LogoutResponseDto>("/auth/logout", {
    method: "POST",
    accessToken,
  });
