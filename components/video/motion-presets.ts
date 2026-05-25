/** Shared motion tokens for video list / card animations */

/** Premium ease-out expo — crisp settle without a hard snap */
export const PREMIUM_EASE = [0.23, 1, 0.32, 1] as const;

/** Soft ease-in-out — section headings and secondary fades */
export const SMOOTH_EASE = [0.25, 0.1, 0.25, 1] as const;

export const PREMIUM_VIEWPORT = {
  once: true,
  margin: "0px 0px -25% 0px",
} as const;

export const PREMIUM_SPRING = {
  type: "spring" as const,
  stiffness: 260,
  damping: 28,
  mass: 0.85,
};

export const PREMIUM_SPRING_GENTLE = {
  type: "spring" as const,
  stiffness: 200,
  damping: 26,
  mass: 1,
};

/** Hover / lift — slower, heavier settle */
export const PREMIUM_SPRING_HOVER = {
  type: "spring" as const,
  stiffness: 170,
  damping: 34,
  mass: 1.15,
};

/** Press feedback — quick but not snappy */
export const PREMIUM_SPRING_PRESS = {
  type: "spring" as const,
  stiffness: 320,
  damping: 32,
  mass: 0.9,
};

/** List row entrance — layered fade, lift, de-blur, and soft scale */
export const ENTRANCE_TRANSITION = {
  opacity: { duration: 0.55, ease: PREMIUM_EASE },
  y: { type: "spring" as const, stiffness: 110, damping: 22, mass: 0.95 },
  scale: { type: "spring" as const, stiffness: 110, damping: 22, mass: 0.95 },
  filter: { duration: 0.5, ease: PREMIUM_EASE },
};

/** Container only orchestrates stagger — children carry the visual entrance */
export const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.065,
      delayChildren: 0.08,
    },
  },
};

export const listItemVariants = {
  hidden: {
    opacity: 0,
    y: 22,
    scale: 0.97,
    filter: "blur(10px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: ENTRANCE_TRANSITION,
  },
};

/** Propagates from motion.li — thumbnail then metadata cascade + hover group */
export const cardArticleVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.12,
    },
  },
  hover: {
    x: 2,
    transition: PREMIUM_SPRING_HOVER,
  },
  tap: {
    x: 1,
    scale: 0.998,
    transition: PREMIUM_SPRING_PRESS,
  },
};

export const cardThumbVariants = {
  hidden: { opacity: 0, scale: 0.94, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      opacity: { duration: 0.5, ease: PREMIUM_EASE },
      scale: { ...PREMIUM_SPRING_GENTLE },
      filter: { duration: 0.45, ease: PREMIUM_EASE },
    },
  },
  hover: {
    scale: 1.02,
    filter: "brightness(1.03)",
    transition: PREMIUM_SPRING_HOVER,
  },
};

export const cardTextVariants = {
  hidden: { opacity: 0, x: -6 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: PREMIUM_EASE },
  },
  hover: {
    x: 1,
    transition: PREMIUM_SPRING_HOVER,
  },
};

export const sectionHeadingVariants = {
  hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      opacity: { duration: 0.55, ease: SMOOTH_EASE },
      y: { type: "spring" as const, stiffness: 120, damping: 24, mass: 0.95 },
      filter: { duration: 0.45, ease: SMOOTH_EASE },
    },
  },
};
