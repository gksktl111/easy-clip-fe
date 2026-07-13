import { BillingResultPage } from "@/features/subscription";

interface BillingFailProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const getStringParam = (
  params: Record<string, string | string[] | undefined>,
  key: string,
) => {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
};

export default async function BillingFail({ searchParams }: BillingFailProps) {
  const params = await searchParams;

  return (
    <BillingResultPage
      status="fail"
      errorMessage={getStringParam(params, "message")}
    />
  );
}
