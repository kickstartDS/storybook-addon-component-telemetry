import React from "react";
import { styled } from "@storybook/theming";
import { useEffect, useState } from "react";

import { Preview } from "@storybook/components";
import { ResponsiveRadar } from '@nivo/radar';
import { ResponsiveBar } from '@nivo/bar';

import components from "./ComponentMap";
import { Section } from "@kickstartds/base/lib/section";
import { Headline } from "@kickstartds/base/lib/headline";

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

const toTitleCase = (str: string) =>
  str.replace('-', ' ').replace(
    /\w\S*/g,
    (txt) =>txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
  );

export const TabContent: React.FC<TabContentProps> = ({ componentType, componentUses, componentPropStats }) => {
  const radars: Record<string, any>[] = [];
  const bars: Record<string, any>[] = [];

  for (const [key, value] of Object.entries(componentPropStats)) {
    // TODO handle number, boolean
    switch (value.type) {
      case 'enum':
        radars.push({
          title: key,
          values: Object.keys(value.distribution).map((distributionName) => { 
            const entry: any = {};
            entry[key.split('.').pop()] = distributionName;
            entry[componentType] = value.distribution[distributionName];
            return entry;
          })
        })
        break;
      case 'string':
        bars.push({
          title: key,
          values: value.lengths.map((length: number, index: number) => {
            return {
              "bar": index,
              "length": length,
            };
          }),
        });
        break;
    }
  }

  const loadableComponents:any = [];
  Object.keys(componentUses).map(() => {
    loadableComponents.push(components[componentType]);
  });

  const [componentsLoaded, setComponentsLoaded] = useState(false);

  useEffect(() => {
    Promise.all(loadableComponents.map((component:any) => component.load())).then(() => setComponentsLoaded(true));
  }, [componentUses]);

  // TODO write human-friendly version of `componentType` in headlines
  // TODO use columns in `Preview` for low-width components (Button, Content Box, etc)
  return (
    <TabWrapper>
      <TabInner>
        <Section key="section-0" headline={{ content: `Telemetry for ${toTitleCase(componentType)}`, level: 'h1', pageHeader: true }} width="max" mode="list" spaceBefore="none" spaceAfter="small">
          <p>Info about the general usage, the prop distribution and all existing uses of {componentType} component</p>
        </Section>
        {radars && <Section key="section-1" headline={{ content: `Option usage distributions for ${toTitleCase(componentType)}` }} width="max" mode="tile" spaceBefore="none" spaceAfter="small">
          {radars.sort((a, b) => a.title < b.title ? -1 : 1).map((enumVal, index) => {
            return (
              <div key={index} style={{ height: '280px' }}>
                <Headline content={enumVal.title} level="h3" styleAs="h4" spaceAfter="none" pageHeader={true} />
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
                  curve="cardinalClosed"
                />
              </div>
            );
          })}
        </Section>}

        {bars && <Section key="section-2" headline={{ content: `String prop lengths for ${toTitleCase(componentType)}` }} width="max" mode="tile" spaceBefore="none" spaceAfter="small">
          {bars.sort((a, b) => a.title < b.title ? -1 : 1).map((bar, index) => {
            return (
              <div key={index} style={{ width: '450px', height: '300px' }}>
                <Headline content={bar.title} level="h3" styleAs="h4" spaceAfter="none" pageHeader={true} />
                <ResponsiveBar
                  data={bar.values}
                  keys={[
                    'length',
                  ]}
                  indexBy="bar"
                  margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                  padding={0.6}
                  valueScale={{ type: 'linear' }}
                  indexScale={{ type: 'band', round: true }}
                  colors={{ scheme: 'nivo' }}
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                  }}
                  labelSkipWidth={12}
                  labelSkipHeight={12}
                  labelTextColor={{
                    from: 'color',
                    modifiers: [
                      [
                        'darker',
                        1.6
                      ]
                    ]
                  }}
                />
              </div>
            );
          })}
        </Section>}

        {componentsLoaded && <Section key="section-3" headline={{ content: `All uses of ${toTitleCase(componentType)}` }} width="max" mode="list" spaceBefore="none" spaceAfter="none">
          {componentUses && Object.keys(componentUses).length && Object.keys(componentUses).sort((a, b) => a < b ? -1 : 1).map((componentUse, index) => {
            const Component = loadableComponents[index];
            return (
              <div key={index}>
                <Headline content={toTitleCase(componentUse.replace('-', ' '))} level="h3" />
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
