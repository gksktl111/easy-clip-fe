export interface AuthAccountResponseDto {
  id: string;
  provider: "GOOGLE" | "GITHUB";
  email: string;
}

export interface AuthUserResponseDto {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface AuthSignInResponseDto {
  access_token: string;
  refresh_token: string;
  user: AuthUserResponseDto;
}

export interface RefreshAccessTokenResponseDto {
  access_token: string;
}

export interface UserProfileResponseDto {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  authAccounts: AuthAccountResponseDto[];
}

export interface LogoutResponseDto {
  success: boolean;
}
