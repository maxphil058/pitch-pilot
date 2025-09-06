// src/lib/video/ffmpeg.ts
import ffmpeg from "fluent-ffmpeg";
import { createRequire } from "module";

let wired = false;

export function configureFfmpeg() {
  if (!wired) {
    // 1) Explicit override via env
    const envPath = process.env.FFMPEG_PATH?.trim();
    if (envPath) {
      ffmpeg.setFfmpegPath(envPath);
    } else {
      // 2) Resolve from node_modules at runtime to avoid Next bundling
      const require = createRequire(import.meta.url);
      const ffmpegStaticPath = require("ffmpeg-static"); // absolute path
      if (typeof ffmpegStaticPath === "string" && ffmpegStaticPath.length > 0) {
        ffmpeg.setFfmpegPath(ffmpegStaticPath);
      }
    }
    wired = true;
  }
  return ffmpeg;
}
