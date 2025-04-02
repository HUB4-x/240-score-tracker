import { createLocalStorageStore } from "./storeMGMT";

export const settings = createLocalStorageStore('settings', {darkMode: false});