import { afterEach, describe, expect, it, vi } from "vitest";
import type { BillingAuthRequestResponseDto } from "@/features/subscription/model/subscription.dto";

interface MockScript {
  async: boolean;
  id: string;
  onerror: (() => void) | null;
  onload: (() => void) | null;
  remove: ReturnType<typeof vi.fn>;
  src: string;
}

const billingAuthRequest: BillingAuthRequestResponseDto = {
  clientKey: "test-client-key",
  customerKey: "test-customer-key",
  failUrl: "https://example.com/billing/fail",
  method: "CARD",
  successUrl: "https://example.com/billing/success",
};

const createDocumentMock = () => {
  const scriptsById = new Map<string, MockScript>();
  const appendedScripts: MockScript[] = [];
  const head = {
    appendChild: vi.fn((script: MockScript) => {
      scriptsById.set(script.id, script);
      appendedScripts.push(script);
      return script;
    }),
  };
  const document = {
    createElement: vi.fn(() => {
      const script: MockScript = {
        async: false,
        id: "",
        onerror: null,
        onload: null,
        remove: vi.fn(),
        src: "",
      };

      script.remove.mockImplementation(() => {
        scriptsById.delete(script.id);
      });

      return script;
    }),
    getElementById: vi.fn((id: string) => scriptsById.get(id) ?? null),
    head,
  };

  return { appendedScripts, document };
};

afterEach(() => {
  vi.resetModules();
  vi.unstubAllGlobals();
});

describe("tossPaymentsSdk", () => {
  it("이미 로드된 SDK로 빌링 인증을 요청한다", async () => {
    const requestBillingAuth = vi.fn().mockResolvedValue(undefined);
    const tossPayments = vi.fn(() => ({ requestBillingAuth }));

    vi.stubGlobal("window", { TossPayments: tossPayments });

    const { requestBillingAuth: requestTossBillingAuth } = await import(
      "@/features/subscription/service/tossPaymentsSdk"
    );

    await requestTossBillingAuth(billingAuthRequest);

    expect(tossPayments).toHaveBeenCalledWith(billingAuthRequest.clientKey);
    expect(requestBillingAuth).toHaveBeenCalledWith("카드", {
      customerKey: billingAuthRequest.customerKey,
      failUrl: billingAuthRequest.failUrl,
      successUrl: billingAuthRequest.successUrl,
    });
  });

  it("SDK 로딩 실패 후 재시도하면 새 script를 삽입한다", async () => {
    const { appendedScripts, document } = createDocumentMock();

    vi.stubGlobal("document", document);
    vi.stubGlobal("window", {});

    const { loadTossPaymentsScript } = await import(
      "@/features/subscription/service/tossPaymentsSdk"
    );
    const firstAttempt = loadTossPaymentsScript();
    const firstRejection = expect(firstAttempt).rejects.toThrow(
      "결제 모듈을 불러오지 못했습니다.",
    );

    appendedScripts[0]?.onerror?.();
    await firstRejection;

    const retryAttempt = loadTossPaymentsScript();
    const retryRejection = expect(retryAttempt).rejects.toThrow(
      "결제 모듈을 불러오지 못했습니다.",
    );

    expect(appendedScripts).toHaveLength(2);
    expect(appendedScripts[0]?.remove).toHaveBeenCalledOnce();
    expect(appendedScripts[1]).not.toBe(appendedScripts[0]);

    appendedScripts[1]?.onerror?.();
    await retryRejection;
  });
});
