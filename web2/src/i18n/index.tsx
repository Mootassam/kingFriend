import en from "src/i18n/en";

const dictionaries = { en };
type Language = keyof typeof dictionaries;

let current: Language = "en";

export async function init(language: Language = "en") {
  current = language;
}

export function getLanguageCode(): string {
  return current;
}

// Resolves a dotted key such as "menu.home"; returns the key itself when missing.
export function i18n(key: string): string {
  const value = key
    .split(".")
    .reduce<any>((node, part) => (node == null ? undefined : node[part]), dictionaries[current]);
  return typeof value === "string" ? value : key;
}
