/** Shared motion tokens for video list / card animations */

/** Soft ease-in-out — avoids the snap-to-opaque “blink” of ease-out-expo */
export const SMOOTH_EASE = [0.25, 0.1, 0.25, 1] as const;

export const PREMIUM_VIEWPORT = {
  once: true,
  margin: "0px 0px -25% 0px",
} as const;

export const PREMIUM_SPRING = {
  type: "spring" as const,
  stiffness: 220,
  damping: 30,
  mass: 1,
};

export const PREMIUM_SPRING_GENTLE = {
  type: "spring" as const,
  stiffness: 180,
  damping: 26,
  mass: 1.1,
};

/** Entrance: opacity fades slowly; position follows a soft spring */
export const ENTRANCE_TRANSITION = {
  opacity: { duration: 0.75, ease: SMOOTH_EASE },
  y: { type: "spring" as const, stiffness: 85, damping: 22, mass: 1.25 },
};

export const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const listItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: ENTRANCE_TRANSITION,
  },
};

export const sectionHeadingVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      opacity: { duration: 0.6, ease: SMOOTH_EASE },
      y: { type: "spring" as const, stiffness: 100, damping: 24, mass: 1 },
    },
  },
};
