import {
  UpdateUserSettingsDto,
  UserSettingsResponseDto,
} from "@/features/settings/model/settings.dto";
import { apiRequest } from "@/shared/lib/apiClient";

export const fetchMySettings = async (accessToken: string) =>
  apiRequest<UserSettingsResponseDto>("/users/me/settings", {
    accessToken,
    cache: "no-store",
  });

export const updateMySettings = async (
  accessToken: string,
  payload: UpdateUserSettingsDto,
) =>
  apiRequest<UserSettingsResponseDto>("/users/me/settings", {
    method: "PATCH",
    accessToken,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
