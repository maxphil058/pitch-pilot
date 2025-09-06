import { NextRequest, NextResponse } from 'next/server';
import path from "node:path";
import fs from "node:fs/promises";
import ffmpeg from "fluent-ffmpeg";
import { configureFfmpeg } from "@/lib/video/ffmpeg";
import { toAsciiSafe, writeOverlayTextFile } from "@/lib/video/text";
import { meshBus } from "@/lib/event-bus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const FONT_PATH = path.join(process.cwd(), "public", "fonts", "DejaVuSans.ttf");

const exists = async (p: string) => !!(await fs.access(p).then(() => true).catch(() => false));

const publishEvent = async (event: { topic: string; payload: any }) => {
  meshBus.emitEvent({
    ...event,
    time: new Date().toISOString()
  });
};

async function buildAndRunFfmpegV2(scriptText: string): Promise<{ path: string; overlayDisabled?: boolean }> {
  const ff = configureFfmpeg();

  const assetsDir = path.join(process.cwd(), "public", "video", "assets");
  const candidates = ["clip1.mp4", "clip2.mp4", "clip3.mp4"]
    .map(n => path.join(assetsDir, n));
  const availableClips: string[] = [];
  for (const c of candidates) if (await exists(c)) availableClips.push(c);

  const bgPath = path.join(assetsDir, "bg.mp3");
  const hasBg = await exists(bgPath);

  const outPath = "/tmp/generated_v2.mp4";

  // Safe text processing
  const rawScript = (scriptText ?? "PitchPilot: Build funnels that sell themselves.").toString();
  const safeText = toAsciiSafe(rawScript);
  const textFile = await writeOverlayTextFile(safeText);
  const fontExists = await fs.access(FONT_PATH).then(() => true).catch(() => false);

  await publishEvent({ topic: "pitchpilot/video/progress", payload: { step: "render-start" } });

  return await new Promise<{ path: string; overlayDisabled?: boolean }>((resolve, reject) => {
    try {
      const cmd = ff();

      // Input wiring - use available clips or fallback to synthetic video
      if (availableClips.length > 0) {
        availableClips.forEach((clip) => cmd.input(clip));
      } else {
        // Fallback: synthetic black video
        cmd.input("color=c=black:s=1280x720:r=30:d=6").inputFormat("lavfi");
      }

      // Title card (1s)
      cmd.input("color=c=black:s=1280x720:r=30:d=1").inputFormat("lavfi");
      
      // Outro card (2s)
      cmd.input("color=c=black:s=1280x720:r=30:d=2").inputFormat("lavfi");

      if (hasBg) {
        cmd.input(bgPath);
      }

      // Build complex filter pipeline
      const filters: ffmpeg.FilterSpecification[] = [];
      const videoCount = Math.max(availableClips.length, 1);
      const titleIndex = videoCount;
      const outroIndex = videoCount + 1;

      // 1) Normalize each video input with crop (no black bars) -> [v0]..[vN-1]
      for (let i = 0; i < videoCount; i++) {
        const inLabel = `${i}:v`;
        filters.push(
          { filter: "scale", options: { w: 1280, h: 720, force_original_aspect_ratio: "increase" }, inputs: inLabel, outputs: `s${i}` },
          { filter: "crop", options: { w: 1280, h: 720 }, inputs: `s${i}`, outputs: `c${i}` },
          { filter: "fps", options: { fps: 30 }, inputs: `c${i}`, outputs: `v${i}` }
        );
      }

      // 2) Process title and outro cards
      filters.push(
        { filter: "fps", options: { fps: 30 }, inputs: `${titleIndex}:v`, outputs: "vtitle" },
        { filter: "fps", options: { fps: 30 }, inputs: `${outroIndex}:v`, outputs: "voutro" }
      );

      // 3) Add title text to title card
      if (fontExists) {
        filters.push({
          filter: "drawtext",
          options: {
            fontfile: FONT_PATH,
            text: "PitchPilot",
            fontcolor: "white",
            fontsize: 48,
            x: "(w-text_w)/2",
            y: "(h-text_h)/2",
            box: 1,
            boxcolor: "blue@0.8",
            boxborderw: 20,
          },
          inputs: "vtitle",
          outputs: "vtitle_text",
        });
      }

      // 4) Add outro text to outro card
      if (fontExists) {
        filters.push({
          filter: "drawtext",
          options: {
            fontfile: FONT_PATH,
            text: "Thank you for watching!",
            fontcolor: "white",
            fontsize: 36,
            x: "(w-text_w)/2",
            y: "(h-text_h)/2",
            box: 1,
            boxcolor: "purple@0.8",
            boxborderw: 15,
          },
          inputs: "voutro",
          outputs: "voutro_text",
        });
      }

      // 5) Concat all segments: title + clips + outro
      const concatInputs = [];
      concatInputs.push(fontExists ? "vtitle_text" : "vtitle");
      for (let i = 0; i < videoCount; i++) {
        concatInputs.push(`v${i}`);
      }
      concatInputs.push(fontExists ? "voutro_text" : "voutro");

      filters.push({
        filter: "concat",
        options: { n: concatInputs.length, v: 1, a: 0 },
        inputs: concatInputs,
        outputs: "vcat",
      });

      // 6) Add main text overlay with segments
      if (fontExists) {
        filters.push({
          filter: "drawtext",
          options: {
            fontfile: FONT_PATH,
            textfile: textFile,
            reload: 0,
            fontcolor: "white",
            fontsize: 32,
            x: "(w-text_w)/2",
            y: "h-text_h-50",
            box: 1,
            boxcolor: "black@0.5",
            boxborderw: 10,
            enable: "between(t,1,7)", // Skip title (1s) and outro
          },
          inputs: "vcat",
          outputs: "vout",
        });
      }

      // 7) If bg.mp3 exists, normalize audio and produce [aout]
      if (hasBg) {
        const bgInputIndex = videoCount + 2; // after clips, title, outro
        filters.push({
          filter: "aresample",
          options: { async: 1, first_pts: 0 },
          inputs: `${bgInputIndex}:a:0`,
          outputs: "aout",
        });
      }

      // Apply complex filter once
      cmd.complexFilter(filters);

      // Global stability & output options
      cmd
        .addOption("-nostdin")
        .addOption("-threads", "1")
        .addOption("-hide_banner")
        .addOption("-loglevel", "error")
        .outputOptions([
          "-movflags", "+faststart",
          "-pix_fmt", "yuv420p",
          "-c:v", "libx264",
          "-preset", "fast",
          "-crf", "23",
        ]);

      // Correct mapping
      const maps: string[] = [];
      maps.push("-map", fontExists ? "[vout]" : "[vcat]");
      if (hasBg) maps.push("-map", "[aout]");
      maps.push("-shortest");
      cmd.outputOptions(maps);

      let triedNoOverlay = false;

      const runCommand = () => {
        cmd
          .on("start", (commandLine) => {
            console.log("FFmpeg V2 command:", commandLine);
            publishEvent({ topic: "pitchpilot/video/progress", payload: { step: "ffmpeg-start" } });
          })
          .on("progress", (progress) => {
            console.log("FFmpeg V2 progress:", progress.percent + "%");
          })
          .on("error", async (err: any) => {
            console.error("FFmpeg V2 error:", err);
            
            if (!triedNoOverlay && fontExists) {
              triedNoOverlay = true;
              console.log("V2 retrying without text overlay...");
              
              // Rebuild command without drawtext
              const retryCmd = ff();
              
              // Same inputs
              if (availableClips.length > 0) {
                availableClips.forEach((clip) => retryCmd.input(clip));
              } else {
                retryCmd.input("color=c=black:s=1280x720:r=30:d=6").inputFormat("lavfi");
              }
              retryCmd.input("color=c=black:s=1280x720:r=30:d=1").inputFormat("lavfi");
              retryCmd.input("color=c=black:s=1280x720:r=30:d=2").inputFormat("lavfi");
              if (hasBg) retryCmd.input(bgPath);
              
              // Same normalization and concat, but no drawtext
              const retryFilters: ffmpeg.FilterSpecification[] = [];
              for (let i = 0; i < videoCount; i++) {
                const inLabel = `${i}:v`;
                retryFilters.push(
                  { filter: "scale", options: { w: 1280, h: 720, force_original_aspect_ratio: "increase" }, inputs: inLabel, outputs: `s${i}` },
                  { filter: "crop", options: { w: 1280, h: 720 }, inputs: `s${i}`, outputs: `c${i}` },
                  { filter: "fps", options: { fps: 30 }, inputs: `c${i}`, outputs: `v${i}` }
                );
              }
              
              retryFilters.push(
                { filter: "fps", options: { fps: 30 }, inputs: `${titleIndex}:v`, outputs: "vtitle" },
                { filter: "fps", options: { fps: 30 }, inputs: `${outroIndex}:v`, outputs: "voutro" }
              );
              
              const retryConcatInputs = ["vtitle"];
              for (let i = 0; i < videoCount; i++) {
                retryConcatInputs.push(`v${i}`);
              }
              retryConcatInputs.push("voutro");
              
              retryFilters.push({
                filter: "concat",
                options: { n: retryConcatInputs.length, v: 1, a: 0 },
                inputs: retryConcatInputs,
                outputs: "vcat",
              });
              
              if (hasBg) {
                const bgInputIndex = videoCount + 2;
                retryFilters.push({
                  filter: "aresample",
                  options: { async: 1, first_pts: 0 },
                  inputs: `${bgInputIndex}:a:0`,
                  outputs: "aout",
                });
              }
              
              retryCmd.complexFilter(retryFilters);
              retryCmd
                .addOption("-nostdin")
                .addOption("-threads", "1")
                .addOption("-hide_banner")
                .addOption("-loglevel", "error")
                .outputOptions([
                  "-movflags", "+faststart",
                  "-pix_fmt", "yuv420p",
                  "-c:v", "libx264",
                  "-preset", "fast",
                  "-crf", "23",
                ]);
              
              const retryMaps: string[] = [];
              retryMaps.push("-map", "[vcat]");
              if (hasBg) retryMaps.push("-map", "[aout]");
              retryMaps.push("-shortest");
              retryCmd.outputOptions(retryMaps);
              
              retryCmd
                .on("start", () => {
                  publishEvent({ topic: "pitchpilot/video/progress", payload: { step: "overlay-disabled" } });
                })
                .on("error", (retryErr: any) => {
                  console.error("V2 retry also failed:", retryErr);
                  publishEvent({ topic: "pitchpilot/video/progress", payload: { step: "error", message: String(retryErr) } }).finally(() => {
                    reject(retryErr);
                  });
                })
                .on("end", () => {
                  console.log("FFmpeg V2 completed successfully (no overlay)");
                  publishEvent({ topic: "pitchpilot/video/done", payload: { file: "/api/video/download-v2" } }).finally(() => {
                    resolve({ path: outPath, overlayDisabled: true });
                  });
                })
                .save(outPath);
              
              return;
            }
            
            publishEvent({ topic: "pitchpilot/video/progress", payload: { step: "error", message: String(err) } }).finally(() => {
              reject(err);
            });
          })
          .on("end", () => {
            console.log("FFmpeg V2 completed successfully");
            publishEvent({ topic: "pitchpilot/video/done", payload: { file: "/api/video/download-v2" } }).finally(() => {
              resolve({ path: outPath });
            });
          })
          .save(outPath);
      };

      runCommand();
        
    } catch (error) {
      console.error("FFmpeg V2 setup error:", error);
      reject(error);
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { script } = body;

    if (!script || typeof script !== 'string') {
      return NextResponse.json(
        { error: 'Script is required and must be a string' },
        { status: 400 }
      );
    }

    await publishEvent({ topic: "pitchpilot/video/progress", payload: { step: "start" } });

    const result = await buildAndRunFfmpegV2(script);

    return NextResponse.json({
      ok: true,
      file: "/api/video/download-v2",
      poster: "/api/video/poster-v2",
      ...(result.overlayDisabled && { overlayDisabled: true })
    });

  } catch (error) {
    console.error('Video V2 generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate video' },
      { status: 500 }
    );
  }
}
