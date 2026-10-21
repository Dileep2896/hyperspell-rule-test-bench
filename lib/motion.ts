// Shared motion tokens (ecc:motion-foundations style): one easing, a few durations, two springs.
export const EASE = [0.22, 1, 0.36, 1] as const;
export const motionTokens = {
  duration: { fast: 0.18, normal: 0.32, slow: 0.6, story: 0.8 },
  distance: { sm: 8, md: 16, lg: 32, xl: 64 },
  stagger: 0.08,
} as const;
export const springs = {
  snappy: { type: "spring", stiffness: 420, damping: 32 },
  gentle: { type: "spring", stiffness: 180, damping: 24 },
} as const;
