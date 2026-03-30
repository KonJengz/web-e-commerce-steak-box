import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const simLoading = (seconds: number = 2) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, seconds * 1000);
  });
};
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!navigator.clipboard) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);

    return true;
  } catch (error) {
    console.error("Failed to copy text: ", error);

    return false;
  }
}
