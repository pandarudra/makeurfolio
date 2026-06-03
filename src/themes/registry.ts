/**
 * Theme Registry — Maps themeId strings to their React component implementations.
 *
 * This is the single source of truth for theme resolution.
 * No switch statements spread across the codebase.
 *
 * To add a new theme:
 * 1. Create theme folder in src/themes/<theme-id>/
 * 2. Implement a default export accepting PortfolioThemeProps
 * 3. Import and register it here
 */

import { ComponentType } from "react";
import type { PortfolioThemeProps } from "./shared/types";
import MinimalEditorialTheme from "./minimal-editorial";
import FounderOSTheme from "./founder-os";

export const themeRegistry: Record<string, ComponentType<PortfolioThemeProps>> = {
  "minimal-editorial": MinimalEditorialTheme,
  "founder-os": FounderOSTheme,
};

export const DEFAULT_THEME_ID = "minimal-editorial";
