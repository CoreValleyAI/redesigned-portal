"use client";

import * as React from "react";
import { Tabs } from "@/components/ui";

/**
 * Material content tabs (`=== "Label"` blocks). The panels arrive as
 * server-rendered children, each a `div.md-tabpanel[data-title]`; this
 * island only decides which one is visible. Inactive panels stay in the DOM
 * (hidden) so anchors and find-in-page keep working.
 */
export function DocTabs({ children }: { children: React.ReactNode }) {
  const id = React.useId();
  const panels = React.Children.toArray(children).filter(
    (c): c is React.ReactElement<{ "data-title"?: string }> => React.isValidElement(c),
  );
  const tabs = panels.map((p, i) => ({
    id: String(i),
    label: p.props["data-title"] || `Tab ${i + 1}`,
  }));
  const [active, setActive] = React.useState("0");

  if (panels.length === 0) return null;

  return (
    <div className="md-tabs">
      <Tabs tabs={tabs} value={active} onChange={setActive} aria-label="Content tabs" />
      {panels.map((panel, i) => {
        const on = String(i) === active;
        return (
          <div
            key={i}
            role="tabpanel"
            id={`${id}-panel-${i}`}
            hidden={!on}
            tabIndex={0}
            className="pt-4"
          >
            {panel}
          </div>
        );
      })}
    </div>
  );
}
