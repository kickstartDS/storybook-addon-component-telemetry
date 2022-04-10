import React from "react";
import { useArgs } from "@storybook/api";

import { pack } from "@kickstartds/core/lib/storybook/helpers";
import { Section } from "@kickstartds/base/lib/section";

interface PanelContentProps {
  componentType: string
  componentUses: Record<string, any>
}

// TODO make this nicer looking

const toTitleCase = (str: string) =>
  str.replace('-', ' ').replace(
    /\w\S*/g,
    (txt) =>txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
  );

export const PanelContent: React.FC<PanelContentProps> = ({
  componentType,
  componentUses,
}) => {
  const [_, updateArgs, resetArgs] = useArgs();
  const update = (e:any) => {
    resetArgs();
    updateArgs(pack(componentUses[Object.keys(componentUses).sort((a, b) => a < b ? -1 : 1)[e.target.dataset.index]]));
  };

  return (
    <Section key="section-3" headline={{ content: `All uses of ${toTitleCase(componentType)}`, styleAs: "h4" }} width="max" mode="list" spaceBefore="none" spaceAfter="none">
      <ul>
      {componentUses && Object.keys(componentUses).length && Object.keys(componentUses).sort((a, b) => a < b ? -1 : 1).map((componentUse, index) => {
        return (
          <li key={index} data-index={index} onClick={update}>{toTitleCase(componentUse.replace('-', ' '))}</li>
        );
      })}
      </ul>
    </Section>
  )
};
