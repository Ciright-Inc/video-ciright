import { PREMIUM_EASE, PREMIUM_SPRING_PRESS } from "@/components/video/motion-presets";

export const dialMenuPanelVariants = {
  hidden: { opacity: 0, scale: 0.96, y: -6 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 380,
      damping: 28,
      mass: 0.82,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: -4,
    transition: { duration: 0.16, ease: [0.4, 0, 1, 1] as const },
  },
};

export const dialMenuHintVariants = {
  hidden: { opacity: 0, y: 4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: PREMIUM_EASE },
  },
  exit: {
    opacity: 0,
    y: -2,
    transition: { duration: 0.14, ease: [0.4, 0, 1, 1] as const },
  },
};

export const dialMenuListVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.035, delayChildren: 0.04 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.12 },
  },
};

export const dialMenuItemVariants = {
  hidden: { opacity: 0, x: -6 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2, ease: PREMIUM_EASE },
  },
};

export const dialTriggerTap = {
  scale: 0.97,
  transition: PREMIUM_SPRING_PRESS,
};
