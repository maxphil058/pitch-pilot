import fs from "node:fs/promises";

const TXT_PATH = "/tmp/pitchpilot_draw.txt";

/** Convert to safe ASCII (strip emoji/unicode), collapse whitespace, cap length */
export function toAsciiSafe(input: string, maxLen = 160) {
  const ascii = (input ?? "")
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, " ")   // strip non-ASCII (emojis, etc.)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen);
  return ascii.length ? ascii : "PitchPilot";
}

export async function writeOverlayTextFile(text: string) {
  await fs.writeFile(TXT_PATH, text, "utf8");
  return TXT_PATH;
}
