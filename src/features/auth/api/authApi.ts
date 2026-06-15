import { AuthProvider } from "@/features/auth/model/auth";
import {
  AuthSignInResponseDto,
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

// 테스트용
export const testAdminLogin = async () =>
  apiRequest<AuthSignInResponseDto>("/auth/test/admin-login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      platform: "WEB",
    }),
  });
