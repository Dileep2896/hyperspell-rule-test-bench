import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/judge/route";

const body = {
  ruleVersion: { ruleId: "compensation", version: 1, name: "Compensation", kind: "filter", description: "Anything about money or pay" },
  examples: [
    { id: "a", title: "a", label: "no-match", text: "Pay the $25 registration, all money goes to the food bank.", source: { connectionIds: ["gmail-priya"] }, synthetic: true },
    { id: "b", title: "b", label: "no-match", text: "Team offsite agenda.", source: { connectionIds: ["notion"] }, synthetic: true },
  ],
};

const req = (b: unknown) => new Request("http://localhost/api/judge", { method: "POST", body: JSON.stringify(b), headers: { "content-type": "application/json" } });

describe("POST /api/judge", () => {
  it("judges the posted examples with the local judge", async () => {
    const res = await POST(req(body));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.judge).toBe("local");
    expect(data.judgements.a.matched).toBe(true);
    expect(data.judgements.b.matched).toBe(false);
  });

  it("rejects malformed bodies with 400", async () => {
    const res = await POST(req({ ruleVersion: { kind: "nope" }, examples: [] }));
    expect(res.status).toBe(400);
  });

  it("rejects oversized example sets", async () => {
    const many = Array.from({ length: 201 }, (_, i) => ({ ...body.examples[0], id: `x${i}` }));
    const res = await POST(req({ ...body, examples: many }));
    expect(res.status).toBe(400);
  });

  it("rejects invalid JSON", async () => {
    const res = await POST(new Request("http://localhost/api/judge", { method: "POST", body: "{" }));
    expect(res.status).toBe(400);
  });
});
