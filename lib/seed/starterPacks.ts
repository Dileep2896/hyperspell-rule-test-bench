// The ONLY loader for synthetic example content outside the seed rules themselves.
import type { Example } from "../types";
import {
  compensationExamples,
  credentialExamples,
  customerCallExamples,
  legalExamples,
  productMeetingExamples,
  starterExtras,
} from "./examples";

export interface StarterPack {
  id: string;
  label: string;
  examples: Example[];
}

export const starterPacks: StarterPack[] = [
  { id: "compensation", label: "Compensation", examples: [...compensationExamples, ...(starterExtras.compensation ?? [])] },
  { id: "legal", label: "Legal", examples: [...legalExamples, ...(starterExtras.legal ?? [])] },
  { id: "credentials", label: "Credentials", examples: [...credentialExamples, ...(starterExtras.credentials ?? [])] },
  { id: "customer-calls", label: "Customer calls", examples: [...customerCallExamples, ...(starterExtras["customer-calls"] ?? [])] },
  { id: "product-meetings", label: "Product meetings", examples: [...productMeetingExamples, ...(starterExtras["product-meetings"] ?? [])] },
];
