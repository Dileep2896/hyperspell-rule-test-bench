import { describe, expect, it } from "vitest";
import { splitOnPassage, vaguenessHint } from "@/lib/highlight";

describe("splitOnPassage", () => {
  it("splits around the passage", () => {
    expect(splitOnPassage("A. Pay now. C.", "Pay now.")).toEqual(["A. ", "Pay now.", " C."]);
  });
  it("returns the whole text when passage is null or missing", () => {
    expect(splitOnPassage("abc", null)).toEqual(["abc", "", ""]);
    expect(splitOnPassage("abc", "zzz")).toEqual(["abc", "", ""]);
  });
});

describe("vaguenessHint", () => {
  it("flags the docs' weak description", () => {
    expect(vaguenessHint("Anything about money or pay")).toMatch(/vague matches/);
  });
  it("flags very short descriptions and empty ones", () => {
    expect(vaguenessHint("Calls")).toMatch(/Short descriptions/);
    expect(vaguenessHint("  ")).toMatch(/Describe/);
  });
  it("accepts the docs' better description", () => {
    expect(vaguenessHint("Salary figures, compensation bands, bonus and equity for named employees")).toBeNull();
  });
});
