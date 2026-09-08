import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { confirm } = vi.hoisted(() => ({ confirm: vi.fn() }));
vi.mock("../api/subscriptionApi", () => ({ confirmBillingAuth: confirm }));

const payload = { authKey: "test-auth", customerKey: "test-customer" };

beforeEach(() => {
  vi.resetModules();
  confirm.mockReset();
  const stored = new Map<string, string>();
  vi.stubGlobal("sessionStorage", {
    getItem: (key: string) => stored.get(key) ?? null,
    setItem: (key: string, value: string) => stored.set(key, value),
  });
});

afterEach(() => vi.unstubAllGlobals());

describe("결제 인증 중복 제출 방지", () => {
  it("동시 호출과 화면 재진입은 한 번의 confirm 결과를 공유한다", async () => {
    const result = { plan: "PRO" };
    confirm.mockResolvedValue(result);
    const { confirmBillingAuthOnce } = await import("./confirmBillingAuthOnce");
    const first = confirmBillingAuthOnce("user", payload);
    expect(confirmBillingAuthOnce("user", payload)).toBe(first);
    await expect(first).resolves.toEqual(result);
    await expect(confirmBillingAuthOnce("user", payload)).resolves.toEqual(
      result,
    );
    expect(confirm).toHaveBeenCalledExactlyOnceWith(payload);
  });

  it("응답 유실 후 재호출과 새로고침에도 confirm을 다시 보내지 않는다", async () => {
    confirm.mockRejectedValue(new TypeError("Failed to fetch"));
    const firstModule = await import("./confirmBillingAuthOnce");
    await expect(
      firstModule.confirmBillingAuthOnce("user", payload),
    ).rejects.toThrow("Failed to fetch");
    await expect(
      firstModule.confirmBillingAuthOnce("user", payload),
    ).rejects.toThrow("Failed to fetch");
    vi.resetModules();
    const reloaded = await import("./confirmBillingAuthOnce");
    await expect(
      reloaded.confirmBillingAuthOnce("user", payload),
    ).rejects.toBeInstanceOf(reloaded.BillingConfirmationAlreadySubmittedError);
    expect(confirm).toHaveBeenCalledTimes(1);
  });

  it("제출 이력을 저장할 수 없으면 결제를 보내지 않는다", async () => {
    vi.stubGlobal("sessionStorage", {
      getItem: () => null,
      setItem: () => {
        throw new Error("Storage unavailable");
      },
    });
    const { confirmBillingAuthOnce } = await import("./confirmBillingAuthOnce");
    await expect(confirmBillingAuthOnce("user", payload)).rejects.toThrow(
      "Storage unavailable",
    );
    expect(confirm).not.toHaveBeenCalled();
  });
});
