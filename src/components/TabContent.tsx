import React from "react";
import { styled } from "@storybook/theming";
import { Title, Source, Preview } from "@storybook/components";
import { Visual, VisualContextDefault, VisualContext } from "@kickstartds/content/lib/visual";
import { Section } from "@kickstartds/base/lib/section";

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

const WrappedVisual = (props: Record<string, any>) => {
  console.log('props', props);
  if (props.media && props.media.image) {
    if (props.media.image.srcDesktop && props.media.image.srcDesktop.publicURL) {
      props.media.image.srcDesktop = `https://www.kickstartds.com${props.media.image.srcDesktop.publicURL}`;
    }
    if (props.media.image.srcTablet && props.media.image.srcTablet.publicURL) {
      props.media.image.srcTablet = `https://www.kickstartds.com${props.media.image.srcTablet.publicURL}`;
    }
    if (props.media.image.srcMobile && props.media.image.srcMobile.publicURL) {
      props.media.image.src = props.media.image.srcMobile;
      if (props.media.image.src.childImageSharp) delete props.media.image.src.childImageSharp;
      props.media.image.srcMobile = `https://www.kickstartds.com${props.media.image.srcMobile.publicURL}`;
    }
  }

  return <VisualContextDefault {...props} />;
};

// TODO fix typings
const VisualProvider = (props: Record<string, any>) => (
  <VisualContext.Provider value={WrappedVisual} {...props} />
);

interface TabContentProps {
  componentUses: Record<string, any>;
}

export const TabContent: React.FC<TabContentProps> = ({ componentUses }) => (
  <TabWrapper>
    <TabInner>
      <Section headline={{ content: 'Usage statistics for Visual component' }} width="max" mode="list" spaceBefore="none" spaceAfter="small">
        <p>Coming soon...</p>
      </Section>

      <VisualProvider>
        <Section headline={{ content: 'Real uses of Visual component' }} width="max" mode="list" spaceBefore="none" spaceAfter="none">
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
      </VisualProvider>
    </TabInner>
  </TabWrapper>
);
