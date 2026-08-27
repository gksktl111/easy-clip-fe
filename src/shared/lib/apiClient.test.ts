import { afterEach, describe, expect, it, vi } from "vitest";

const createErrorResponse = () =>
  new Response(JSON.stringify({ message: "인증에 실패했습니다." }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });

afterEach(() => {
  vi.resetModules();
  vi.unstubAllGlobals();
});

describe("apiClient 인증 만료 알림", () => {
  it("refresh 최종 실패 시 만료 이벤트를 한 번만 알린다", async () => {
    const eventTarget = new EventTarget();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(createErrorResponse())
      .mockResolvedValueOnce(createErrorResponse());

    vi.stubGlobal("window", eventTarget);
    vi.stubGlobal("fetch", fetchMock);

    const { apiRequest, subscribeToAuthExpired } = await import(
      "@/shared/lib/apiClient"
    );
    const onAuthExpired = vi.fn();
    const unsubscribe = subscribeToAuthExpired(onAuthExpired);

    await expect(apiRequest("/clips")).rejects.toMatchObject({ status: 401 });

    expect(onAuthExpired).toHaveBeenCalledOnce();
    unsubscribe();
  });

  it("refresh 후 재시도한 요청이 401이면 만료 이벤트를 알린다", async () => {
    const eventTarget = new EventTarget();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(createErrorResponse())
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(createErrorResponse());

    vi.stubGlobal("window", eventTarget);
    vi.stubGlobal("fetch", fetchMock);

    const { apiRequest, subscribeToAuthExpired } = await import(
      "@/shared/lib/apiClient"
    );
    const onAuthExpired = vi.fn();
    const unsubscribe = subscribeToAuthExpired(onAuthExpired);

    await expect(apiRequest("/clips")).rejects.toMatchObject({ status: 401 });

    expect(onAuthExpired).toHaveBeenCalledOnce();
    unsubscribe();
  });

  it("refresh를 건너뛴 로그아웃 요청의 401은 만료 이벤트로 알리지 않는다", async () => {
    const eventTarget = new EventTarget();
    const fetchMock = vi.fn().mockResolvedValueOnce(createErrorResponse());

    vi.stubGlobal("window", eventTarget);
    vi.stubGlobal("fetch", fetchMock);

    const { apiRequest, subscribeToAuthExpired } = await import(
      "@/shared/lib/apiClient"
    );
    const onAuthExpired = vi.fn();
    const unsubscribe = subscribeToAuthExpired(onAuthExpired);

    await expect(
      apiRequest("/auth/logout", { method: "POST", skipAuthRefresh: true }),
    ).rejects.toMatchObject({ status: 401 });

    expect(onAuthExpired).not.toHaveBeenCalled();
    unsubscribe();
  });
});
