import { describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { createInvoice } from "./actions";

describe("invoices actions", () => {
  it("returns validation error for invalid createInvoice payload", async () => {
    const result = await createInvoice({});

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe("VALIDATION_ERROR");
    }
  });
});
