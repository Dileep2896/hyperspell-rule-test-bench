import { describe, expect, it } from "vitest";
import { DEFAULT_THRESHOLDS, actsOn, bandFor, validateThresholds } from "@/lib/bands";

describe("bandFor", () => {
  it("uses the documented defaults auto >= 0.75, ignore < 0.45", () => {
    expect(DEFAULT_THRESHOLDS).toEqual({ auto: 0.75, ignore: 0.45 });
  });

  it("puts exactly 0.75 in auto and 0.7499 in review", () => {
    expect(bandFor(0.75)).toBe("auto");
    expect(bandFor(0.7499)).toBe("review");
  });

  it("puts exactly 0.45 in review and 0.4499 in ignore", () => {
    expect(bandFor(0.45)).toBe("review");
    expect(bandFor(0.4499)).toBe("ignore");
  });

  it("clamps confidence outside [0,1]", () => {
    expect(bandFor(1.7)).toBe("auto");
    expect(bandFor(-3)).toBe("ignore");
    expect(bandFor(Number.NaN)).toBe("ignore");
  });

  it("honors custom thresholds", () => {
    expect(bandFor(0.6, { auto: 0.6, ignore: 0.2 })).toBe("auto");
    expect(bandFor(0.19, { auto: 0.6, ignore: 0.2 })).toBe("ignore");
  });

  it("throws on invalid thresholds", () => {
    expect(() => bandFor(0.5, { auto: 0.4, ignore: 0.5 })).toThrow(/ignore/);
  });
});

describe("validateThresholds", () => {
  it("accepts ignore < auto inside [0,1]", () => {
    expect(validateThresholds({ auto: 0.8, ignore: 0.3 })).toEqual({ ok: true, thresholds: { auto: 0.8, ignore: 0.3 } });
  });

  it("rejects ignore >= auto", () => {
    const r = validateThresholds({ auto: 0.5, ignore: 0.5 });
    expect(r.ok).toBe(false);
  });

  it("clamps values to [0,1] before checking", () => {
    expect(validateThresholds({ auto: 1.4, ignore: -0.2 })).toEqual({ ok: true, thresholds: { auto: 1, ignore: 0 } });
  });
});

describe("actsOn", () => {
  it("filter rules act on any band other than ignore (docs: filters act on any match)", () => {
    expect(actsOn("filter", "review")).toBe(true);
    expect(actsOn("filter", "auto")).toBe(true);
    expect(actsOn("filter", "ignore")).toBe(false);
  });

  it("sharing rules share only in auto and ask the owner in review", () => {
    expect(actsOn("sharing", "auto")).toBe(true);
    expect(actsOn("sharing", "review")).toBe(true);
    expect(actsOn("sharing", "ignore")).toBe(false);
  });
});
