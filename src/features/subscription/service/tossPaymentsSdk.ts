import type { BillingAuthRequestResponseDto } from "@/features/subscription/model/subscription.dto";

interface TossPaymentsClient {
  requestBillingAuth: (
    method: string,
    options: {
      customerKey: string;
      successUrl: string;
      failUrl: string;
    },
  ) => Promise<void>;
}

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => TossPaymentsClient;
  }
}

const TOSS_PAYMENTS_SCRIPT_ID = "toss-payments-sdk";
const TOSS_PAYMENTS_SCRIPT_SRC = "https://js.tosspayments.com/v1/payment";

let tossPaymentsScriptPromise: Promise<void> | null = null;

const mapBillingAuthMethod = (
  method: BillingAuthRequestResponseDto["method"],
) => (method === "CARD" ? "카드" : method);

// 실패한 script와 loading Promise를 함께 비워 다음 시도에서 새 script를 삽입합니다.
export const loadTossPaymentsScript = () => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("결제 환경을 확인할 수 없습니다."));
  }

  if (window.TossPayments) {
    return Promise.resolve();
  }

  if (tossPaymentsScriptPromise) {
    return tossPaymentsScriptPromise;
  }

  tossPaymentsScriptPromise = new Promise<void>((resolve, reject) => {
    document.getElementById(TOSS_PAYMENTS_SCRIPT_ID)?.remove();

    const resetScriptPromise = () => {
      tossPaymentsScriptPromise = null;
    };

    const script = document.createElement("script");
    script.id = TOSS_PAYMENTS_SCRIPT_ID;
    script.src = TOSS_PAYMENTS_SCRIPT_SRC;
    script.async = true;

    script.onload = () => {
      resetScriptPromise();

      if (window.TossPayments) {
        resolve();
        return;
      }

      script.remove();
      reject(new Error("결제 모듈을 시작하지 못했습니다."));
    };

    script.onerror = () => {
      resetScriptPromise();
      script.remove();
      reject(new Error("결제 모듈을 불러오지 못했습니다."));
    };

    document.head.appendChild(script);
  });

  return tossPaymentsScriptPromise;
};

export const requestBillingAuth = async (
  request: BillingAuthRequestResponseDto,
) => {
  await loadTossPaymentsScript();

  const tossPayments = window.TossPayments?.(request.clientKey);

  if (!tossPayments) {
    throw new Error("결제 모듈을 시작하지 못했습니다.");
  }

  await tossPayments.requestBillingAuth(mapBillingAuthMethod(request.method), {
    customerKey: request.customerKey,
    successUrl: request.successUrl,
    failUrl: request.failUrl,
  });
};
