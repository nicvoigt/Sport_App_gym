import { feature as gym } from "@app/feature-gym";
import { feature as run } from "@app/feature-run";
import { feature as nutrition } from "@app/feature-nutrition";
import { feature as weight } from "@app/feature-weight";
import { feature as more } from "@app/feature-more";
import type { FeatureModule, NavItem, RouteDef } from "@app/contracts";

export const FEATURES: FeatureModule[] = [gym, weight, run, nutrition, more];

export const NAV_ITEMS: NavItem[] = FEATURES.map((feature) => feature.nav).sort(
  (a, b) => (a.order ?? 0) - (b.order ?? 0)
);

export const ROUTES: RouteDef[] = FEATURES.flatMap((feature) => feature.routes);
