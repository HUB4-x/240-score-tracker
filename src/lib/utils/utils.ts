import { THEME_LOCALSTORAGE_KEY } from '../configs/localStorageKeys'
import { type Theme, current_theme, themes } from "../stores/UI_Values";

export function getLocalStorageSize(): [string, number] {
    // Max storage size is (for most browsers 5000kb)
    let total = 0;
    for (let key in localStorage) {
        if (!localStorage.hasOwnProperty(key)) continue;
        const value = localStorage.getItem(key);
        if(value){
            total += key.length + value.length;
        }
    }
    let storageUsed_number = ((total * 2 / 1024)/5000)*100
    let storageUsed_string = (total * 2 / 1024).toFixed(2) + ' KB'
    // Each character ≈ 2 bytes
    return [storageUsed_string, storageUsed_number]
}



export function getInitialTheme(): Theme {
  if (typeof localStorage === "undefined") return themes.dark;

  return (localStorage.getItem(THEME_LOCALSTORAGE_KEY) as Theme) ?? themes.dark;
}

export function initTheme() {
  const savedTheme = localStorage.getItem(THEME_LOCALSTORAGE_KEY);

  if (savedTheme === "dart_240_dark" || savedTheme === "dart_240_light") {
    document.documentElement.setAttribute("data-theme", savedTheme);
    current_theme.set(savedTheme);
  } else {
    document.documentElement.setAttribute("data-theme", "dart_240_dark");
    localStorage.setItem(THEME_LOCALSTORAGE_KEY, "dart_240_dark");
    current_theme.set("dart_240_dark");
  }
}


export function setTheme(newTheme: Theme) {
  current_theme.set(newTheme);

  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem(THEME_LOCALSTORAGE_KEY, newTheme);
}

export function toggleTheme() {
  current_theme.update((currentTheme) => {
    const newTheme =
      currentTheme === themes.dark ? themes.light : themes.dark;

    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem(THEME_LOCALSTORAGE_KEY, newTheme);

    return newTheme;
  });
}