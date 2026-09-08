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

    const { apiRequest, subscribeToAuthExpired } =
      await import("@/shared/lib/apiClient");
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

    const { apiRequest, subscribeToAuthExpired } =
      await import("@/shared/lib/apiClient");
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

    const { apiRequest, subscribeToAuthExpired } =
      await import("@/shared/lib/apiClient");
    const onAuthExpired = vi.fn();
    const unsubscribe = subscribeToAuthExpired(onAuthExpired);

    await expect(
      apiRequest("/auth/logout", { method: "POST", skipAuthRefresh: true }),
    ).rejects.toMatchObject({ status: 401 });

    expect(onAuthExpired).not.toHaveBeenCalled();
    unsubscribe();
  });
});

describe("apiClient 성공 응답 파싱", () => {
  it("200 응답 본문이 비어 있으면 null을 반환한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(new Response(null, { status: 200 })),
    );

    const { apiRequest } = await import("@/shared/lib/apiClient");

    await expect(apiRequest<null>("/empty-response")).resolves.toBeNull();
  });
});

describe("정책 오류와 오래된 권한 응답", () => {
  it.each([
    {
      status: 400,
      body: { message: ["입력 오류", 12], details: [] },
      message: "입력 오류",
      code: undefined,
    },
    {
      status: 403,
      body: { message: "일반 접근 오류", code: "UNKNOWN_POLICY" },
      message: "일반 접근 오류",
      code: "UNKNOWN_POLICY",
    },
    {
      status: 409,
      body: { message: "부모 폴더 복구 필요" },
      message: "부모 폴더 복구 필요",
      code: undefined,
    },
    {
      status: 409,
      body: {},
      message: "Request failed with status 409",
      code: undefined,
    },
  ])(
    "$status 오류의 미지 코드와 누락 필드를 일반 오류로 유지한다",
    async ({ status, body, message, code }) => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify(body), { status }));
      vi.stubGlobal("fetch", fetchMock);
      const { apiRequest } = await import("./apiClient");
      await expect(
        apiRequest("/clips", { method: "POST" }),
      ).rejects.toMatchObject({ status, message, code, details: undefined });
      expect(fetchMock).toHaveBeenCalledTimes(1);
    },
  );

  it("오류 코드·상세 및 문자열 배열 메시지를 보존한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            message: ["첫 오류", "다음 오류"],
            code: "CLIP_LIMIT_EXCEEDED",
            details: {
              limit: 300,
              currentCount: 300,
              upgradeCanResolve: false,
            },
          }),
          { status: 409 },
        ),
      ),
    );
    const { apiRequest } = await import("./apiClient");
    await expect(
      apiRequest("/clips", { method: "POST" }),
    ).rejects.toMatchObject({
      status: 409,
      code: "CLIP_LIMIT_EXCEEDED",
      message: "첫 오류\n다음 오류",
      details: { limit: 300, currentCount: 300, upgradeCanResolve: false },
    });
  });

  it("권한 변경 전에 시작한 콘텐츠 응답을 버린다", async () => {
    let resolve!: (response: Response) => void;
    vi.stubGlobal(
      "fetch",
      vi.fn(
        () =>
          new Promise<Response>((done) => {
            resolve = done;
          }),
      ),
    );
    const { apiRequest } = await import("./apiClient");
    const { advanceAccessGeneration, AccessChangedError } =
      await import("@/shared/access/accessEvents");
    const request = apiRequest("/clips?type=ALL");
    advanceAccessGeneration();
    resolve(
      new Response(
        JSON.stringify({ items: [{ title: "이전 Pro 비공개 콘텐츠" }] }),
      ),
    );
    await expect(request).rejects.toBeInstanceOf(AccessChangedError);
  });
});
