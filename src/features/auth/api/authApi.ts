import { AuthProvider } from "@/features/auth/model/auth";
import {
  LogoutResponseDto,
  RefreshAccessTokenResponseDto,
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
    credentials: "include",
  });

export const refreshAccessToken = async () =>
  apiRequest<RefreshAccessTokenResponseDto>("/auth/refresh", {
    method: "POST",
    credentials: "include",
  });

// 테스트 어드민 로그인 API는 실제 OAuth 연동 전 임시 우회용으로 사용했습니다.
// export const testAdminLogin = async () =>
//   apiRequest<AuthSignInResponseDto>("/auth/test/admin-login", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       platform: "WEB",
//     }),
//   });
