export function openModal(id: string): void {
  const dialog = document.getElementById(id) as HTMLDialogElement | null;
  if (!dialog) {
    console.warn(`Modal with id "${id}" not found`);
    return;
  }
  dialog.showModal();
}

export function closeModal(id: string): void {
  const dialog = document.getElementById(id) as HTMLDialogElement | null;
  if (!dialog) {
    console.warn(`Modal with id "${id}" not found`);
    return;
  }
  dialog.close();
}

export function isValidHexColor(value: string): boolean {
  if (!value) return false;

  const trimmed = value.trim();
  // allows: #fff, #ffffff, fff, ffffff
  const hexRegex = /^#?([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/;

  return hexRegex.test(trimmed);
}

export function getRandomHexColor(): string {
  const value = Math.floor(Math.random() * 0xffffff); // 0 .. 16777215
  return '#' + value.toString(16).padStart(6, '0');
}


export function goto(path: string){
    window.location.href = window.location.href.split('#/')[0] + path
}