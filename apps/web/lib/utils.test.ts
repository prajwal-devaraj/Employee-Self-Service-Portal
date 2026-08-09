import { describe, expect, it } from "vitest";

import { initials, money } from "@/lib/utils";

describe("utils", () => {
  it("creates initials", () => {
    expect(initials("Jordan", "Lee")).toBe("JL");
  });

  it("formats currency", () => {
    expect(money("5957.50")).toContain("5,957.50");
  });
});
