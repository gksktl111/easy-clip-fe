import type { Page } from "@playwright/test";
export const prepareBillingRedirect = async (
  page: Page,
  customerKey: string,
) => {
  await page.addInitScript(
    async ({ customerKey }) => {
      const digest = async (value: string) => {
        const hash = await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(value),
        );
        return Array.from(new Uint8Array(hash), (value) =>
          value.toString(16).padStart(2, "0"),
        ).join("");
      };
      const prefix = `billing-attempt:${await digest("user-1")}`;
      const id = "12345678-1234-4123-8123-123456789012";
      const key = `${prefix}:${id}`;
      const customerHash = await digest(customerKey);
      if (!localStorage.getItem(key)) {
        localStorage.setItem(
          key,
          JSON.stringify({
            idempotencyKey: id,
            priceVersion: "test-price-v1",
            customerHash,
            submitted: false,
          }),
        );
        localStorage.setItem(`${prefix}:active`, id);
      }
    },
    { customerKey },
  );
};
