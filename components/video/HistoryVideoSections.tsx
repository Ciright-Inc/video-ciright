"use client";

import { motion, useReducedMotion } from "motion/react";
import { RelatedVideoList, type RelatedVideoListItem } from "./RelatedVideoList";
import { PREMIUM_VIEWPORT, sectionHeadingVariants } from "./motion-presets";

export type HistorySection = {
  label: string;
  items: RelatedVideoListItem[];
};

interface HistoryVideoSectionsProps {
  sections: HistorySection[];
}

/** Extra pause between date groups (Today → Yesterday, etc.) */
const SECTION_CASCADE_DELAY = 0.14;

export function HistoryVideoSections({ sections }: HistoryVideoSectionsProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.label}>
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
              {section.label}
            </h3>
            <RelatedVideoList items={section.items} className="gap-4" />
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sections.map((section, index) => {
        const sectionDelay = index * SECTION_CASCADE_DELAY;

        return (
          <section key={section.label}>
            <motion.h3
              className="mb-3 text-sm font-semibold text-muted-foreground"
              initial="hidden"
              whileInView="visible"
              viewport={PREMIUM_VIEWPORT}
              variants={{
                hidden: sectionHeadingVariants.hidden,
                visible: {
                  ...sectionHeadingVariants.visible,
                  transition: {
                    ...sectionHeadingVariants.visible.transition,
                    delay: sectionDelay,
                  },
                },
              }}
            >
              {section.label}
            </motion.h3>
            <RelatedVideoList
              items={section.items}
              className="gap-4"
              entranceDelay={sectionDelay + 0.1}
            />
          </section>
        );
      })}
    </div>
  );
}
