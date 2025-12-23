declare module "@tracker/contracts" {
  import type { ComponentType } from "react";
  import type { ZodTypeAny } from "zod";

  export type FeatureId = string & { readonly __brand: "FeatureId" };
  export type EntryTypeId = string & { readonly __brand: "EntryTypeId" };
  export type WidgetId = string & { readonly __brand: "WidgetId" };

  export interface EntryEnvelope<TPayload = unknown> {
    id: string;
    type: EntryTypeId;
    startAt: string;
    payload: TPayload;
  }

  export interface EntryFormProps<TPayload> {
    initialValue?: TPayload;
    onSubmit: (payload: TPayload) => void;
    onCancel?: () => void;
  }

  export interface EntryCardProps<TPayload> {
    entry: EntryEnvelope<TPayload>;
  }

  export interface EntryTypeDef<TPayload = unknown> {
    id: EntryTypeId;
    label: string;
    payloadSchema: ZodTypeAny;
    Form: ComponentType<EntryFormProps<TPayload>>;
    Card: ComponentType<EntryCardProps<TPayload>>;
  }

  export interface WidgetContext {
    services: {
      entryStore: {
        query: (options: {
          types: EntryTypeId[];
          limit?: number;
          sortBy?: "startAt";
          sortDir?: "asc" | "desc";
        }) => Promise<EntryEnvelope[]>;
      };
      navigate: (path: string) => void;
    };
  }

  export interface WidgetProps<TConfig> {
    config: TConfig;
    ctx: WidgetContext;
  }

  export interface WidgetDef<TConfig = unknown> {
    id: WidgetId;
    label: string;
    configSchema: ZodTypeAny;
    Component: ComponentType<WidgetProps<TConfig>>;
  }

  export interface FeatureModule {
    id: FeatureId;
    requiredContracts: string;
    entryTypes: EntryTypeDef[];
    widgets?: WidgetDef[];
  }

  export function asFeatureId(id: string): FeatureId;
  export function asEntryTypeId(id: string): EntryTypeId;
  export function asWidgetId(id: string): WidgetId;
  export function defineFeature(module: FeatureModule): FeatureModule;
}

declare module "@tracker/plugin-sdk" {
  import type { FeatureModule } from "@tracker/contracts";

  export function defineFeature(module: FeatureModule): FeatureModule;
}
