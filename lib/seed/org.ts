// Northwind: a fictional org used for every demo scenario. No real people or content.
import type { Connection, Member } from "../types";

export const ORG_NAME = "Northwind";

export const members: Member[] = [
  { id: "priya", name: "Priya" },
  { id: "marco", name: "Marco" },
  { id: "dana", name: "Dana" },
  { id: "lee", name: "Lee" },
];

export const connections: Connection[] = [
  { id: "notion", tool: "Notion", kind: "shared" },
  { id: "linear", tool: "Linear", kind: "shared" },
  { id: "drive", tool: "Google Drive", kind: "shared" },
  { id: "gmail-priya", tool: "Gmail", kind: "personal", ownerId: "priya" },
  { id: "gmail-dana", tool: "Gmail", kind: "personal", ownerId: "dana" },
  { id: "granola-priya", tool: "Granola", kind: "personal", ownerId: "priya" },
  { id: "granola-dana", tool: "Granola", kind: "personal", ownerId: "dana" },
  { id: "slack-dm-marco", tool: "Slack DMs", kind: "personal", ownerId: "marco" },
  { id: "slack-dm-lee", tool: "Slack DMs", kind: "personal", ownerId: "lee" },
];

/** Members who turned sharing rules on for their personal content. Marco and Lee have not. */
export const sharingOptIn = ["priya", "dana"];

export function connectionById(id: string): Connection | undefined {
  return connections.find((c) => c.id === id);
}
