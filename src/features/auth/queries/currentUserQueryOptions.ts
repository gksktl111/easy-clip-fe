import { queryOptions } from "@tanstack/react-query";
import { restoreSessionFromRefreshCookie } from "@/features/auth/service/authService";
import { authQueryKeys } from "@/features/auth/service/authQueryCache";

// 액세스 토큰 갱신은 apiClient가 담당하므로, 인증 확인 자체는 사용자가 재시도합니다.
export const currentUserQueryOptions = () =>
  queryOptions({
    queryKey: authQueryKeys.currentUser(),
    queryFn: restoreSessionFromRefreshCookie,
    retry: false,
  });
