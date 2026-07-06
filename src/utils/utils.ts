import { Theme, current_theme, themes } from "../stores/UI_Values";

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

  return (localStorage.getItem("theme") as Theme) ?? themes.dark;
}


export function setTheme(newTheme: Theme) {
  current_theme.set(newTheme);

  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", newTheme);
  }

  if (typeof localStorage !== "undefined") {
    localStorage.setItem("theme", newTheme);
  }
}

export function toggleTheme() {
  setTheme(getInitialTheme() === themes.dark ? themes.light : themes.dark);
}