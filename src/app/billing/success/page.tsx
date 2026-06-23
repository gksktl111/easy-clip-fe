import { BillingResultPage } from "@/features/subscription/ui/BillingResultPage";

interface BillingSuccessProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const getStringParam = (
  params: Record<string, string | string[] | undefined>,
  key: string,
) => {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
};

export default async function BillingSuccess({
  searchParams,
}: BillingSuccessProps) {
  const params = await searchParams;

  return (
    <BillingResultPage
      status="success"
      authKey={getStringParam(params, "authKey")}
      customerKey={getStringParam(params, "customerKey")}
    />
  );
}
