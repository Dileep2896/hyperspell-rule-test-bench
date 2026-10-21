import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "..");

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? walk(p) : /\.(ts|tsx)$/.test(d.name) ? [p] : [];
  });
}

const rel = (p: string) => path.relative(root, p);

describe("privacy guarantee: the bench never reads anyone's documents", () => {
  const routeHandlers = walk(path.join(root, "app")).filter((f) => /route\.tsx?$/.test(f));

  it("has at least one route handler to check", () => {
    expect(routeHandlers.length).toBeGreaterThan(0);
  });

  it("no route handler imports seed example content (only the starter-pack loader may)", () => {
    for (const f of routeHandlers) {
      const src = fs.readFileSync(f, "utf8");
      expect(src, rel(f)).not.toMatch(/lib\/seed\/(examples|corpus)/);
    }
  });

  it("only the starter-pack loader and the seed rule file import the example corpus", () => {
    const importers = [...walk(path.join(root, "app")), ...walk(path.join(root, "components")), ...walk(path.join(root, "lib"))]
      .filter((f) => /from\s+["'](?:[^"']*seed\/|\.\/)examples["']/.test(fs.readFileSync(f, "utf8")))
      .map(rel)
      .sort();
    expect(importers).toEqual(["lib/seed/rules.ts", "lib/seed/starterPacks.ts"]);
  });

  it("no source file calls a documents or corpus API", () => {
    for (const f of [...walk(path.join(root, "app")), ...walk(path.join(root, "components")), ...walk(path.join(root, "lib"))]) {
      const src = fs.readFileSync(f, "utf8");
      expect(src, rel(f)).not.toMatch(/fetch\([^)]*\/(documents|memories|corpus)/);
    }
  });

  it("every seed example is marked synthetic", async () => {
    const { allExamples } = await import("@/lib/seed/examples");
    expect(allExamples.length).toBeGreaterThanOrEqual(25);
    for (const e of allExamples) expect(e.synthetic).toBe(true);
  });

  it("the UI carries the persistent privacy note", () => {
    const src = walk(path.join(root, "components")).map((f) => fs.readFileSync(f, "utf8")).join("\n");
    expect(src).toContain("Examples are yours. The bench never reads anyone's documents.");
  });
});
