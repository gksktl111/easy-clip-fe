import { Button } from "@/shared/ui/button/Button";
import { Modal } from "@/shared/ui/overlay/Modal";

// Pro 구독 취소 의사를 확인하고 진행 상태에 따라 액션을 제어합니다.
interface PricingCancelModalProps {
  isCanceling: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function PricingCancelModal({
  isCanceling,
  onCancel,
  onConfirm,
}: PricingCancelModalProps) {
  return (
    <Modal overlay="strong" contentClassName="w-full max-w-sm">
      <div className="rounded-2xl border border-(--border) bg-(--surface-elevated) p-5 shadow-xl">
        <h2 className="text-lg font-semibold">Pro 구독을 취소할까요?</h2>
        <p className="mt-3 text-sm leading-6 text-(--muted)">
          확인을 누르면 Pro 구독의 자동 갱신이 중지되고 Free 플랜으로
          전환됩니다.
        </p>
        <div className="mt-6 flex gap-2">
          <Button
            onClick={onCancel}
            disabled={isCanceling}
            variant="secondary"
            size="lg"
            className="min-h-0 flex-1 py-2.5 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            아니오
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isCanceling}
            variant="primary"
            size="lg"
            className="min-h-0 flex-1 py-2.5 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCanceling ? "변경 중" : "예"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
