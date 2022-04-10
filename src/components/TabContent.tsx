import React from "react";
import { styled } from "@storybook/theming";
import { useEffect, useState } from "react";

import { Title, Preview, Story } from "@storybook/components";
import { ResponsiveRadar } from '@nivo/radar';

import components from "./ComponentMap";
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
  componentType: string
  componentUses: Record<string, any>
  componentPropStats: Record<string, any>
}

export const TabContent: React.FC<TabContentProps> = ({ componentType, componentUses, componentPropStats }) => {
  const loadableComponents:any = [];
  Object.keys(componentUses).map(() => {
    loadableComponents.push(components[componentType]);
  });

  console.log('components', loadableComponents);

  const [componentsLoaded, setComponentsLoaded] = useState(false);

  useEffect(() => {
    Promise.all(loadableComponents.map((component:any) => component.load())).then(() => setComponentsLoaded(true));
  }, [componentUses]);

  const enums: Record<string, any>[] = [];
  for (const [key, value] of Object.entries(componentPropStats)) {
    if (value.type === 'enum') {
      enums.push({
        title: key,
        values: Object.keys(value.distribution).map((distributionName) => { 
          const entry: any = {};
          entry[key.split('.').pop()] = distributionName;
          entry[componentType] = value.distribution[distributionName];
          return entry;
        })
      })
    }
  }

  // TODO write human-friendly version of `componentType` in headlines
  // TODO use columns in `Preview` for low-width components (Button, Content Box, etc)
  return (
    <TabWrapper>
      <TabInner>
        <Section key="section-1" headline={{ content: `Usage statistics for ${componentType}` }} width="max" mode="tile" spaceBefore="none" spaceAfter="small">
          {enums.map((enumVal, index) => {
            return (
              <div key={index} style={{ height: '280px' }}>
                <Title>{enumVal.title}</Title>
                <ResponsiveRadar
                  data={enumVal.values}
                  keys={[ componentType ]}
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

        {componentsLoaded && <Section key="section-2" headline={{ content: `All uses of ${componentType}` }} width="max" mode="list" spaceBefore="none" spaceAfter="none">
          {componentUses && Object.keys(componentUses).length && Object.keys(componentUses).map((componentUse, index) => {
            const Component = loadableComponents[index];
            return (
              <div key={index}>
                <Title>Component: {componentUse}</Title>
                <Preview withToolbar isExpanded={false} withSource={{
                  language: 'json',
                  code: JSON.stringify(componentUses[componentUse], null, 2),
                  format: true,
                }}>
                  <Component {...componentUses[componentUse]} />
                </Preview>
              </div>
            );
          })}
        </Section>}
      </TabInner>
    </TabWrapper>
)
};
