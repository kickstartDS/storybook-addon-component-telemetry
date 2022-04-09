import React from "react";
import { useMemo } from "react";
import { useParameter } from "@storybook/api";
import { PARAM_KEY } from "./constants";
import { TabContent } from "./components/TabContent";
import { unpack } from "@kickstartds/core/lib/storybook/helpers";
import { InfluxDB } from '@influxdata/influxdb-client-browser';

interface TabProps {
  active: boolean;
}

export const Tab: React.FC<TabProps> = ({ active }) => {
  const { jsonschema } = useParameter<any>(PARAM_KEY, {});

  const url = "https://eu-central-1-1.aws.cloud2.influxdata.com";
  const token = "xz9EOdjBaQxKmxQpjTPxsVA_MToZFPBEYZsI04sBFfVE8GiqSK8H0CRWbNkJUqyuucxCS8oxNIhasglqLPXsvw==";
  const org = "64a12d530a48adb2";
  const bucket = "kickstartDS";

  const queryApi = new InfluxDB({ url, token }).getQueryApi(org);
  const fluxQuery =
    `from(bucket:"${bucket}") |> range(start: -1d) |> filter(fn: (r) => r._measurement == "components") |> filter(fn: (r) => r.componentName == "visual")`;

  const componentUses = useMemo(() => {
    const uses: any = {};

    queryApi
      .collectRows(fluxQuery)
      .then((props) => {
        props.forEach((prop: any) => {
          uses[prop.id] = uses[prop.id] || {};
          uses[prop.id][prop._field] = prop._value;
        });
      })
      .catch(error => {
        console.error(error)
      });

    return uses;
  }, [jsonschema]);

  Object.keys(componentUses).forEach((componentUse: string) => {
    componentUses[componentUse] = unpack(componentUses[componentUse]);
  });

  return active ? <TabContent componentUses={componentUses} /> : null;
};
