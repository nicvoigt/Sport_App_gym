declare module "@tracker/contracts" {
  import type React from "react";
  import type { ZodTypeAny } from "zod";

  export type FeatureId = string & { readonly __brand: "FeatureId" };
  export type EntryTypeId = string & { readonly __brand: "EntryTypeId" };
  export type WidgetId = string & { readonly __brand: "WidgetId" };

  export type EntryEnvelope<TPayload = unknown> = {
    id: string;
    type: EntryTypeId;
    startAt: string;
    payload: TPayload;
  };

  export type EntryTypeDef<TPayload = unknown> = {
    id: EntryTypeId;
    name: string;
    description?: string;
    payloadVersion: number;
    payloadSchema: ZodTypeAny;
    Form: React.ComponentType<{
      onSubmit: (payload: TPayload) => void;
      onCancel?: () => void;
    }>;
    Card: React.ComponentType<{ entry: EntryEnvelope<TPayload> }>;
  };

  export type WidgetContext = {
    services: {
      entryStore: {
        query: (params: {
          types: EntryTypeId[];
          limit?: number;
          sortBy?: string;
          sortDir?: "asc" | "desc";
        }) => Promise<EntryEnvelope[]>;
      };
      navigate: (path: string) => void;
    };
  };

  export type WidgetDef<TConfig = unknown> = {
    id: WidgetId;
    name: string;
    description?: string;
    configSchema: ZodTypeAny;
    render: React.ComponentType<{ config: TConfig; ctx: WidgetContext }>;
  };

  export type FeatureModule = {
    id: FeatureId;
    requiredContracts: string;
    entryTypes: EntryTypeDef[];
    widgets: WidgetDef[];
  };

  export const asFeatureId: (value: string) => FeatureId;
  export const asEntryTypeId: (value: string) => EntryTypeId;
  export const asWidgetId: (value: string) => WidgetId;
  export const defineFeature: ((feature: FeatureModule) => FeatureModule) | undefined;
}

declare module "@tracker/plugin-sdk" {
  export {};
}
