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

export function getContrastingTextColor(hex: string): '#000000' | '#ffffff' {
  if (!hex) return '#000000';

  let value = hex.trim();

  // Remove leading '#'
  if (value.startsWith('#')) {
    value = value.slice(1);
  }

  // Expand short form #RGB to #RRGGBB
  if (value.length === 3) {
    value = value
      .split('')
      .map((c) => c + c)
      .join('');
  }

  if (value.length !== 6) return '#000000';

  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);

  // YIQ formula: gives perceived brightness
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;

  // If it's bright, use black text, otherwise white text
  return yiq >= 128 ? '#000000' : '#ffffff';
}


export function goto(path: string){
    window.location.href = window.location.href.split('#/')[0] + path
}