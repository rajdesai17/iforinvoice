import { beforeEach, describe, expect, it, vi } from "vitest";

const selectResultsQueue: unknown[][] = [];

vi.mock("@/lib/db", () => {
  const db = {
    select: vi.fn(() => {
      const result = selectResultsQueue.shift() ?? [];
      const builder = {
        from: vi.fn(() => builder),
        where: vi.fn(() => builder),
        orderBy: vi.fn(() => Promise.resolve(result)),
        then: (resolve: (value: unknown[]) => unknown, reject?: (reason: unknown) => unknown) =>
          Promise.resolve(result).then(resolve, reject),
      };
      return builder;
    }),
  };

  return { db };
});

vi.mock("@/lib/auth/current-user", () => ({
  AuthenticationError: class AuthenticationError extends Error {},
  requireCurrentUserId: vi.fn(async () => "00000000-0000-0000-0000-000000000001"),
}));

vi.mock("@react-pdf/renderer", () => ({
  renderToBuffer: vi.fn(async () => Buffer.from("fake-pdf-content")),
}));

vi.mock("@/components/invoices/invoice-pdf", () => ({
  InvoicePDF: () => null,
}));

import { GET } from "./route";

describe("GET /api/invoices/[id]/pdf", () => {
  beforeEach(() => {
    selectResultsQueue.length = 0;
  });

  it("returns a PDF response when invoice exists", async () => {
    selectResultsQueue.push(
      [{ id: "inv_1", invoiceNumber: "INV-0001", clientId: "cli_1" }],
      [{ id: "cli_1", name: "Client 1" }],
      [{ id: "li_1", description: "Service", quantity: "1", unitPrice: "100", amount: "100", sortOrder: 0 }],
      [{ id: "bp_1", businessName: "My Business" }],
    );

    const response = await GET(new Request("http://localhost/api/invoices/inv_1/pdf"), {
      params: Promise.resolve({ id: "inv_1" }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/pdf");
    expect(response.headers.get("content-disposition")).toContain("INV-0001.pdf");
  });
});
