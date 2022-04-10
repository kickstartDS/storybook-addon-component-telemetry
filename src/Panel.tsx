import React from "react";
import { useMemo } from "react";
import { useParameter, useArgs } from "@storybook/api";
import { PARAM_KEY } from "./constants";
import { PanelContent } from "./components/PanelContent";
import { unpack } from "@kickstartds/core/lib/storybook/helpers";
import { getSchemaName } from "@kickstartds/jsonschema2graphql/build/schemaReducer";
import { InfluxDB } from '@influxdata/influxdb-client-browser';
import { JSONSchema7 } from 'json-schema';
import { AddonPanel } from "@storybook/components";

interface PanelProps {
  active: boolean;
}

const url = "https://eu-central-1-1.aws.cloud2.influxdata.com";
const token = "xz9EOdjBaQxKmxQpjTPxsVA_MToZFPBEYZsI04sBFfVE8GiqSK8H0CRWbNkJUqyuucxCS8oxNIhasglqLPXsvw==";
const org = "64a12d530a48adb2";
const bucket = "kickstartDS";

// TODO major de-duplication, see `Tab.tsx`

export const Panel: React.FC<PanelProps> = (props) => {
  const { jsonschema } = useParameter<{ jsonschema: JSONSchema7 }>(PARAM_KEY, { jsonschema: {} });
  const componentType = getSchemaName(jsonschema.$id);

  const queryApi = new InfluxDB({ url, token }).getQueryApi(org);
  const fluxQuery =
    `from(bucket:"${bucket}") |> range(start: -3d) |> filter(fn: (r) => r._measurement == "components") |> filter(fn: (r) => r.componentName == "${componentType}")`;

  const [args] = useArgs();

  const componentUses = useMemo(() => {
    const uses: any = {};

    // TODO move `https://www.kickstartds.com` to data ingestion phase in gatsby theme,
    // also clean up gatsby image URLs there
    queryApi
      .collectRows(fluxQuery)
      .then((props: any) => {
        props.forEach((prop: any) => {
          const { id, _field: field, _value: value } = prop;
          const fieldKey = field.replace('.publicURL', '');

          if (!uses[id]) {
            uses[id] = {};
            Object.keys(args).forEach((arg) => {
              // TODO `backgroundColor` check as a temp fix vor Visuals
              if (!arg.includes('backgroundColor')) {
                uses[id][arg] = args[arg];
              }
            });
          }

          if (field.includes('childImageSharp')) {
          } else if (field.includes('publicURL')) {
            uses[id][fieldKey] = `https://www.kickstartds.com${value}`;
          } else {
            uses[id][field] = value;
          }
        });
      })
      .catch(error => {
        console.error(error)
      });

    // TODO sort uses, propStats sensibly
    return uses;
  }, [jsonschema]); // TODO check if `[jsonschema]` is really correct here...

  Object.keys(componentUses).forEach((componentUse: string) => {
    componentUses[componentUse] = unpack(componentUses[componentUse]);
  });

  return (
    <AddonPanel {...props}>
      <PanelContent componentType={componentType} componentUses={componentUses} />
    </AddonPanel>
  );
};
