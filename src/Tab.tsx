import React from "react";
import { useMemo } from "react";
import { useParameter, useArgs } from "@storybook/api";
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

const getEnumValues = (schema: JSONSchema7, key: string): any => {
  const segments = key.split('.');

  const field = segments.reduce((prev, segment) => prev?.properties[segment] as JSONSchema7 || prev, schema);
  return field.enum;
};

export const Tab: React.FC<TabProps> = ({ active }) => {
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

  const componentPropStats: any = {};
  Object.keys(componentUses).forEach((componentUse: string) => {
    const use = componentUses[componentUse];

    Object.keys(use).forEach((useArg) => {
      const arg = use[useArg];

      const propType = getType(jsonschema, useArg);
      switch (propType) {
        case 'string':
          componentPropStats[useArg] = componentPropStats[useArg] || { type: 'string', lengths: [] };
          componentPropStats[useArg]['lengths'].push(arg.length)
          break;
        case 'enum':
          componentPropStats[useArg] = componentPropStats[useArg] || { type: 'enum', distribution: {} };
          componentPropStats[useArg]['distribution'][arg] = componentPropStats[useArg]['distribution'][arg] ? componentPropStats[useArg]['distribution'][arg] + 1 : 1;
  
          const enumValues = getEnumValues(jsonschema, useArg);
          enumValues.forEach((enumValue:any) => {
            componentPropStats[useArg]['distribution'][enumValue] = componentPropStats[useArg]['distribution'][enumValue] ? componentPropStats[useArg]['distribution'][enumValue] : 0;
          });
  
          break;
        case 'boolean':
          componentPropStats[useArg] = componentPropStats[useArg] || { type: 'boolean', distribution: {} };
          componentPropStats[useArg]['distribution'][arg] = componentPropStats[useArg]['distribution'][arg.toString()] ? componentPropStats[useArg]['distribution'][arg.toString()] + 1 : 1;
          break;
      }
    });

    componentUses[componentUse] = unpack(componentUses[componentUse]);
  });

  return active ? <TabContent componentType={componentType} componentUses={componentUses} componentPropStats={componentPropStats} /> : null;
};
