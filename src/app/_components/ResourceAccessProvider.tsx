"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { currentUserQueryOptions, useAuth } from "@/features/auth";
import { folderQueryOptions } from "@/features/folder";
import {
  hasEstimatedProAccess,
  mySubscriptionQueryOptions,
} from "@/features/subscription";
import {
  ResourceAccessContext,
  type ResourceAccessState,
} from "@/shared/access/ResourceAccessContext";
import {
  advanceAccessGeneration,
  subscribeToAccessRefresh,
} from "@/shared/access/accessEvents";

const isContentQuery = (query: { queryKey: readonly unknown[] }) =>
  ["clips", "folder-tags", "trash"].includes(String(query.queryKey[0]));

// 앱 조합 계층에서 서버 권한 확인과 도메인 간 캐시 수명만 조율합니다.
export function ResourceAccessProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const queryClient = useQueryClient();
  const folders = useQuery({ ...folderQueryOptions(userId), enabled: false });
  const subscription = useQuery({
    ...mySubscriptionQueryOptions(userId),
    enabled: false,
  });
  const [verification, setVerification] = useState<{
    userId: string | null;
    status: ResourceAccessState["status"];
    revision: number;
  }>({ userId: null, status: "checking", revision: 0 });
  const run = useRef<{ userId: string; promise: Promise<void> } | null>(null);
  const version = useRef(0);
  const signature = useRef("");
  const policyRechecked = useRef(false);

  const refresh = useCallback(async () => {
    if (!userId) return;
    if (run.current?.userId === userId) return run.current.promise;
    const token = ++version.current;
    advanceAccessGeneration();
    setVerification((state) => ({ ...state, userId, status: "checking" }));
    const promise = (async () => {
      await queryClient.cancelQueries({ predicate: isContentQuery });
      try {
        const session = await queryClient.fetchQuery({
          ...currentUserQueryOptions(),
          staleTime: 0,
        });
        // 다른 탭에서 계정이 바뀌었다면 새 계정의 effect가 검증을 이어갑니다.
        if (session.user.id !== userId || version.current !== token) return;
        const [nextFolders, nextSubscription] = await Promise.all([
          queryClient.fetchQuery({
            ...folderQueryOptions(userId),
            staleTime: 0,
            retry: false,
          }),
          queryClient.fetchQuery({
            ...mySubscriptionQueryOptions(userId),
            staleTime: 0,
            retry: false,
          }),
        ]);
        if (version.current !== token) return;
        if (
          nextFolders.some((folder) => typeof folder.isLocked !== "boolean")
        ) {
          queryClient.removeQueries({ predicate: isContentQuery });
          setVerification((state) => ({
            ...state,
            userId,
            status: "incompatible",
          }));
          return;
        }
        const nextSignature = JSON.stringify([
          userId,
          hasEstimatedProAccess(nextSubscription),
          nextFolders.map(({ id, isLocked }) => [id, isLocked]).sort(),
        ]);
        const changed = signature.current !== nextSignature;
        if (changed) {
          queryClient.removeQueries({ predicate: isContentQuery });
          signature.current = nextSignature;
        }
        setVerification((state) => ({
          userId,
          status: "ready",
          revision: state.revision + (changed ? 1 : 0),
        }));
      } catch {
        if (version.current === token) {
          setVerification((state) => ({ ...state, userId, status: "error" }));
        }
      } finally {
        if (version.current === token) run.current = null;
      }
    })();
    run.current = { userId, promise };
    return promise;
  }, [queryClient, userId]);

  useEffect(() => {
    policyRechecked.current = false;
    void refresh();
    const sessionVersion = version;
    return () => {
      ++sessionVersion.current;
      run.current = null;
      advanceAccessGeneration();
      void queryClient.cancelQueries({ predicate: isContentQuery });
      queryClient.removeQueries({ predicate: isContentQuery });
    };
  }, [queryClient, refresh]);

  useEffect(() => {
    const onReturn = () => {
      if (document.visibilityState === "hidden") return;
      policyRechecked.current = false;
      void refresh();
    };
    window.addEventListener("focus", onReturn);
    document.addEventListener("visibilitychange", onReturn);
    const unsubscribe = subscribeToAccessRefresh((reason) => {
      if (reason === "policy" && policyRechecked.current) return;
      policyRechecked.current = reason === "policy";
      if (reason === "mutation" && run.current) {
        void run.current.promise.then(() => refresh());
      } else {
        void refresh();
      }
    });
    return () => {
      window.removeEventListener("focus", onReturn);
      document.removeEventListener("visibilitychange", onReturn);
      unsubscribe();
    };
  }, [refresh]);

  useEffect(() => {
    const end = Date.parse(subscription.data?.currentPeriodEnd ?? "");
    if (!Number.isFinite(end) || end <= Date.now()) return;
    // JS 타이머의 최대 지연을 넘으면 나눠 기다립니다.
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const remaining = end - Date.now();
      if (remaining <= 0) {
        void refresh();
        return;
      }
      timer = setTimeout(schedule, Math.min(remaining, 2_147_483_647));
    };
    schedule();
    return () => clearTimeout(timer);
  }, [subscription.data?.currentPeriodEnd, refresh]);

  const status =
    verification.userId === userId && userId ? verification.status : "checking";
  const folderLocks = Object.fromEntries(
    (folders.data ?? [])
      .filter((folder) => typeof folder.isLocked === "boolean")
      .map((folder) => [folder.id, folder.isLocked as boolean]),
  );
  const isPro =
    status === "ready" && hasEstimatedProAccess(subscription.data ?? null);
  return (
    <ResourceAccessContext.Provider
      value={{
        status,
        scope: `${userId}:${verification.revision}`,
        isPro,
        folderLocks,
        canCreateFolder:
          status === "ready" && (isPro || folders.data?.length === 0),
        refresh,
      }}
    >
      {children}
    </ResourceAccessContext.Provider>
  );
}
