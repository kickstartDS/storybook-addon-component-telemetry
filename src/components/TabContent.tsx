import React from "react";
import { styled } from "@storybook/theming";

import { Title, Preview } from "@storybook/components";
import { ResponsiveRadar } from '@nivo/radar';

import { Visual } from "@kickstartds/content/lib/visual";
import { Section } from "@kickstartds/base/lib/section";

// TODO fix leakage of styles into general Storybook interface (see e.g. story navigation)
import "@kickstartds/core/lib/design-tokens/tokens.css";
import "@kickstartds/base/lib/global/base.js";
import "@kickstartds/base/lib/global/base.css";

import "@kickstartds/design-system/dist/index.css";
import "@kickstartds/design-system/dist/index.js";

const TabWrapper = styled.div(({ theme }) => ({
  background: theme.background.content,
  padding: "4rem 20px",
  minHeight: "100vh",
  boxSizing: "border-box",
}));

const TabInner = styled.div({
  maxWidth: 1440,
  marginLeft: "auto",
  marginRight: "auto",
});

interface TabContentProps {
  componentUses: Record<string, any>
  componentPropStats: Record<string, any>
}

export const TabContent: React.FC<TabContentProps> = ({ componentUses, componentPropStats }) => {
  console.log('componentPropStats', componentPropStats);
  const enums: Record<string, any>[] = [];
  for (const [key, value] of Object.entries(componentPropStats)) {
    if (value.type === 'enum') {
      enums.push({
        title: key,
        values: Object.keys(value.distribution).map((distributionName) => { 
          const entry: any = {};
          entry[key.split('.').pop()] = distributionName;
          entry['visual'] = value.distribution[distributionName];
          return entry;
        })
      })
    }
  }

  return (
    <TabWrapper>
      <TabInner>
        <Section headline={{ content: 'Usage statistics for Visual component' }} width="max" mode="tile" spaceBefore="none" spaceAfter="small">
          {enums.map((enumVal) => {
            return (
              <div style={{ height: '280px' }}>
                <Title>{enumVal.title}</Title>
                <ResponsiveRadar
                  data={enumVal.values}
                  keys={[ 'visual' ]}
                  indexBy={enumVal.title.split('.').pop()}
                  valueFormat=">-.2f"
                  margin={{ top: 70, right: 80, bottom: 40, left: 80 }}
                  borderColor={{ from: 'color' }}
                  gridLabelOffset={36}
                  dotSize={10}
                  dotColor={{ theme: 'background' }}
                  dotBorderWidth={2}
                  colors={{ scheme: 'nivo' }}
                  blendMode="multiply"
                  motionConfig="wobbly"
                />
              </div>
            );
          })}
        </Section>

        <Section headline={{ content: 'All uses of Visual component' }} width="max" mode="list" spaceBefore="none" spaceAfter="none">
          {componentUses && Object.keys(componentUses).length && Object.keys(componentUses).map((componentUse) => {
            return (
              <>
                <Title>Component: {componentUse}</Title>
                <Preview isExpanded={false} withSource={{
                  language: 'json',
                  code: JSON.stringify(componentUses[componentUse], null, 2),
                  format: true,
                }}>
                  <Visual {...componentUses[componentUse]} />
                </Preview>
              </>
            );
          })}
        </Section>
      </TabInner>
    </TabWrapper>
)
};
