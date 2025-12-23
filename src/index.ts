import { z } from "zod";
import type { EntryTypeDef, FeatureModule, WidgetDef } from "@tracker/contracts";
import { GymPayloadSchema } from "./contracts";
import { GymEntryForm } from "./components/GymEntryForm";
import { GymEntryCard } from "./components/GymEntryCard";
import { GymLastWorkoutWidget } from "./components/GymLastWorkoutWidget";
import { featureId, gymEntryTypeId, gymLastWorkoutWidgetId } from "./ids";

const gymEntryType: EntryTypeDef = {
  id: gymEntryTypeId,
  label: "Gym Workout",
  payloadSchema: GymPayloadSchema,
  Form: GymEntryForm,
  Card: GymEntryCard
};

const lastWorkoutWidget: WidgetDef = {
  id: gymLastWorkoutWidgetId,
  label: "Gym: Last Workout",
  configSchema: z.object({}),
  Component: GymLastWorkoutWidget
};

const feature: FeatureModule = {
  id: featureId,
  requiredContracts: "^1.0.0",
  entryTypes: [gymEntryType],
  widgets: [lastWorkoutWidget]
};

export default feature;
export { GymPayloadSchema } from "./contracts";
export { calculateWorkoutVolume } from "./utils/volume";
