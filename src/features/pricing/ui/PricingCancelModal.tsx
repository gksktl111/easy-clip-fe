import { Button } from "@/shared/ui/button/Button";
import { Modal } from "@/shared/ui/overlay/Modal";

// Pro 구독 취소 의사를 확인하고 진행 상태에 따라 액션을 제어합니다.
interface PricingCancelModalProps {
  cancelLabel: string;
  confirmLabel: string;
  confirmingLabel: string;
  description: string;
  isCanceling: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
}

export function PricingCancelModal({
  cancelLabel,
  confirmLabel,
  confirmingLabel,
  description,
  isCanceling,
  onCancel,
  onConfirm,
  title,
}: PricingCancelModalProps) {
  return (
    <Modal overlay="strong" contentClassName="w-full max-w-sm">
      <div className="rounded-2xl border border-(--border) bg-(--surface-elevated) p-5 shadow-xl">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-(--muted)">{description}</p>
        <div className="mt-6 flex gap-2">
          <Button
            onClick={onCancel}
            disabled={isCanceling}
            variant="secondary"
            size="lg"
            className="min-h-0 flex-1 py-2.5 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isCanceling}
            variant="primary"
            size="lg"
            className="min-h-0 flex-1 py-2.5 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCanceling ? confirmingLabel : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
