import { describe, expect, it } from "vitest";
import { formatCurrency, slugify } from "./utils";

describe("formatCurrency", () => {
  it("formats positive amounts", () => {
    expect(formatCurrency(50)).toBe("$50.00");
  });

  it("formats decimal amounts", () => {
    expect(formatCurrency(35.5)).toBe("$35.50");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });
});

describe("slugify", () => {
  it("converts text to slug", () => {
    expect(slugify("Skin Fade")).toBe("skin-fade");
  });

  it("handles special characters", () => {
    expect(slugify("Women's Hair Cut Long")).toBe("womens-hair-cut-long");
  });

  it("handles multiple spaces", () => {
    expect(slugify("beard  trim   with   trimmers")).toBe("beard-trim-with-trimmers");
  });
});
