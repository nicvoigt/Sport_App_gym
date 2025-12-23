import { z } from "zod";
import type { EntryTypeDef, FeatureModule, WidgetDef } from "@tracker/contracts";
import { defineFeature } from "@tracker/contracts";
import { GymEntryCard } from "./components/GymEntryCard";
import { GymEntryForm } from "./components/GymEntryForm";
import { GymPayloadSchema, GYM_PAYLOAD_VERSION } from "./contracts";
import { FEATURE_ID, GYM_ENTRY_TYPE_ID, LAST_WORKOUT_WIDGET_ID } from "./ids";
import { LastWorkoutWidget } from "./widgets/LastWorkoutWidget";

const gymEntryType: EntryTypeDef = {
  id: GYM_ENTRY_TYPE_ID,
  name: "Gym",
  description: "Tracking für Workouts mit Übungen und Sätzen.",
  payloadVersion: GYM_PAYLOAD_VERSION,
  payloadSchema: GymPayloadSchema,
  Form: GymEntryForm,
  Card: GymEntryCard
};

const lastWorkoutWidget: WidgetDef = {
  id: LAST_WORKOUT_WIDGET_ID,
  name: "Gym: Last Workout",
  description: "Zeigt das letzte Gym-Workout an.",
  configSchema: z.object({}),
  render: LastWorkoutWidget
};

const moduleDefinition: FeatureModule = {
  id: FEATURE_ID,
  requiredContracts: "^1.0.0",
  entryTypes: [gymEntryType],
  widgets: [lastWorkoutWidget]
};

const feature = typeof defineFeature === "function" ? defineFeature(moduleDefinition) : moduleDefinition;

export default feature;
export { GymPayloadSchema } from "./contracts";
