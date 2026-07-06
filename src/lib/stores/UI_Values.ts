// src/lib/stores/theme.store.ts
import { writable } from "svelte/store";
import { getInitialTheme, getLocalStorageSize } from "../utils/utils";

export const themes = {
  dark: "dart_240_dark",
  light: "dart_240_light",
} as const;

export type Theme = (typeof themes)[keyof typeof themes];





export const current_theme = writable<Theme>(getInitialTheme());
export const storageUsed_string = writable<string>(getLocalStorageSize()[0]);
export const storageUsed_number = writable<number>(getLocalStorageSize()[1]);
