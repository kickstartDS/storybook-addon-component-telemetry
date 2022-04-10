import { addons, types } from "@storybook/addons";

import { ADDON_ID, TAB_ID, PANEL_ID } from "../constants";
import { Tab } from "../Tab";
import { Panel } from "../Panel";

// Register the addon
addons.register(ADDON_ID, () => {
  // Register the tab
  addons.add(TAB_ID, {
    type: types.TAB,
    title: "Telemetry",
    //👇 Checks the current route for the story
    route: ({ storyId }) => `/telemetry/${storyId}`,
    //👇 Shows the Tab UI element in telemetry view mode
    match: ({ viewMode }) => viewMode === "telemetry",
    render: Tab,
  });

  // Register the panel
  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: "Uses",
    match: ({ viewMode }) => viewMode === "story",
    render: Panel,
  });
});
