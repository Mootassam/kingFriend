// landing.css keeps the template's CSS-module class names, so build them from the same prefix.
const PREFIX = "landing-module__g1LwZa__";

export const cx = (...names: string[]) => names.map((name) => PREFIX + name).join(" ");

export const sectionLinks = [
  { href: "#markets", label: "Markets" },
  { href: "#platforms", label: "Platforms" },
  { href: "#why", label: "Why KingFriend" },
  { href: "#contact", label: "Contact" },
];
