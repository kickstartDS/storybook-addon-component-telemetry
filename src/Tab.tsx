import React, { ForwardRefExoticComponent } from "react";
import { useMemo } from "react";
import { useParameter } from "@storybook/api";
import { PARAM_KEY } from "./constants";
import { TabContent } from "./components/TabContent";
import { unpack } from "@kickstartds/core/lib/storybook/helpers";
import { getSchemaName } from "@kickstartds/jsonschema2graphql/build/schemaReducer";
import { InfluxDB } from '@influxdata/influxdb-client-browser';
import { JSONSchema7 } from 'json-schema';

interface TabProps {
  active: boolean;
}

const url = "https://eu-central-1-1.aws.cloud2.influxdata.com";
const token = "xz9EOdjBaQxKmxQpjTPxsVA_MToZFPBEYZsI04sBFfVE8GiqSK8H0CRWbNkJUqyuucxCS8oxNIhasglqLPXsvw==";
const org = "64a12d530a48adb2";
const bucket = "kickstartDS";

const getType = (schema: JSONSchema7, key: string): string => {
  const segments = key.split('.');

  const field = segments.reduce((prev, segment) => prev?.properties[segment] as JSONSchema7 || prev, schema);
  return field.enum ? 'enum' : field.type.toString();
};

export const Tab: React.FC<TabProps> = ({ active }) => {
  const { jsonschema } = useParameter<{ jsonschema: JSONSchema7 }>(PARAM_KEY, { jsonschema: {} });
  const componentType = getSchemaName(jsonschema.$id);

  const queryApi = new InfluxDB({ url, token }).getQueryApi(org);
  const fluxQuery =
    `from(bucket:"${bucket}") |> range(start: -3d) |> filter(fn: (r) => r._measurement == "components") |> filter(fn: (r) => r.componentName == "${componentType}")`;

  const { uses: componentUses, propStats: componentPropStats } = useMemo(() => {
    const uses: any = {};
    const propStats: any = {};

    // TODO move `https://www.kickstartds.com` to data ingestion phase in gatsby theme,
    // also clean up gatsby image URLs there
    queryApi
      .collectRows(fluxQuery)
      .then((props: any) => {
        props.forEach((prop: any) => {
          const { id, _field: field, _value: value } = prop;
          const fieldKey = field.replace('.publicURL', '');

          uses[id] = uses[id] || {};
          if (field.includes('childImageSharp')) {
          } else if (field.includes('publicURL')) {
            uses[id][fieldKey] = `https://www.kickstartds.com${value}`;
          } else {
            uses[id][field] = value;
          }

          if (!fieldKey.includes('childImageSharp')) {
            const propType = getType(jsonschema, fieldKey);
            switch (propType) {
              case 'string':
                propStats[fieldKey] = propStats[fieldKey] || { type: 'string', lengths: [] };
                propStats[fieldKey]['lengths'].push(value.length)
                break;
              case 'enum':
                propStats[fieldKey] = propStats[fieldKey] || { type: 'enum', distribution: {} };
                propStats[fieldKey]['distribution'][value] = propStats[fieldKey][value] ? propStats[fieldKey][value] + 1 : 1;
                break;
              case 'boolean':
                propStats[fieldKey] = propStats[fieldKey] || { type: 'boolean', distribution: {} };
                propStats[fieldKey]['distribution'][value] = propStats[fieldKey][value.toString()] ? propStats[fieldKey][value.toString()] + 1 : 1;
                break;
            }
          }

          // TODO also add `default` uses implied by respective schema (e.g. `background="default"`)
        });
      })
      .catch(error => {
        console.error(error)
      });

    // TODO sort uses, propStats sensibly
    return {
      uses,
      propStats
    };
  }, [jsonschema]); // TODO check if `[jsonschema]` is really correct here...

  Object.keys(componentUses).forEach((componentUse: string) => {
    componentUses[componentUse] = unpack(componentUses[componentUse]);
  });

  return active ? <TabContent componentType={componentType} componentUses={componentUses} componentPropStats={componentPropStats} /> : null;
};
