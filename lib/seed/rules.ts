import type { Rule, RuleVersion } from "../types";
import {
  compensationExamples,
  credentialExamples,
  customerCallExamples,
  legalExamples,
  productMeetingExamples,
} from "./examples";

const v = (ruleId: string, name: string, kind: Rule["kind"], version: number, description: string): RuleVersion => ({
  ruleId, name, kind, version, description,
});

export const compensationRule: Rule = {
  id: "compensation",
  name: "Compensation",
  kind: "filter",
  versions: [
    // v1 is the docs' "weak" description; v2 is the docs' "better" one.
    v("compensation", "Compensation", "filter", 1, "Anything about money or pay"),
    v("compensation", "Compensation", "filter", 2, "Salary figures, compensation bands, bonus and equity for named employees"),
  ],
  examples: compensationExamples,
};

export const legalRule: Rule = {
  id: "legal",
  name: "Legal advice",
  kind: "filter",
  versions: [v("legal", "Legal advice", "filter", 1, "Privileged legal advice from outside counsel, NDA and contract redlines")],
  examples: legalExamples,
};

export const credentialsRule: Rule = {
  id: "credentials",
  name: "Credentials",
  kind: "filter",
  versions: [v("credentials", "Credentials", "filter", 1, "Passwords, API keys, access tokens and other secrets")],
  examples: credentialExamples,
};

export const customerCallsRule: Rule = {
  id: "customer-calls",
  name: "Customer calls",
  kind: "sharing",
  autoShare: false,
  versions: [
    v("customer-calls", "Customer calls", "sharing", 1, "Calls"),
    v("customer-calls", "Customer calls", "sharing", 2, "Recorded calls and meeting notes with customers or prospects"),
  ],
  examples: customerCallExamples,
};

export const productMeetingsRule: Rule = {
  id: "product-meetings",
  name: "Product meetings",
  kind: "sharing",
  autoShare: false,
  versions: [v("product-meetings", "Product meetings", "sharing", 1, "Product planning meetings, roadmap reviews and spec discussions")],
  examples: productMeetingExamples,
};

export const seedRules: Rule[] = [compensationRule, legalRule, credentialsRule, customerCallsRule, productMeetingsRule];

export function ruleById(id: string): Rule | undefined {
  return seedRules.find((r) => r.id === id);
}
