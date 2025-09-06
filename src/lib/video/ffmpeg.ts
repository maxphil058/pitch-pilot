import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import path from 'path';
import fs from 'fs';

// Point fluent-ffmpeg to the static binary
if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

export interface VideoSegment {
  text: string;
  clipPath: string;
  duration: number;
}

export interface VideoGenerationOptions {
  segments: VideoSegment[];
  outputPath: string;
  backgroundAudioPath?: string;
  audioVolume?: number;
}

export async function generateVideo(options: VideoGenerationOptions): Promise<void> {
  const { segments, outputPath, backgroundAudioPath, audioVolume = 0.2 } = options;
  
  return new Promise((resolve, reject) => {
    // Create a complex filter for concatenating videos and adding text overlays
    const videoInputs: string[] = [];
    const filterComplex: string[] = [];
    
    // Add video inputs and create text overlays
    segments.forEach((segment, index) => {
      videoInputs.push(segment.clipPath);
      
      // Escape text for ffmpeg drawtext filter
      const escapedText = segment.text
        .replace(/'/g, "\\'")
        .replace(/:/g, "\\:")
        .replace(/\[/g, "\\[")
        .replace(/\]/g, "\\]");
      
      // Create text overlay for each segment
      const textFilter = `[${index}:v]drawtext=text='${escapedText}':fontcolor=white:fontsize=28:box=1:boxcolor=black@0.7:boxborderw=8:x=(w-text_w)/2:y=(h-text_h)/2:enable='between(t,0,${segment.duration})'[v${index}]`;
      filterComplex.push(textFilter);
    });
    
    // Create concatenation filter
    const concatInputs = segments.map((_, index) => `[v${index}]`).join('');
    const concatFilter = `${concatInputs}concat=n=${segments.length}:v=1:a=0[outv]`;
    filterComplex.push(concatFilter);
    
    // Start building the ffmpeg command
    let command = ffmpeg();
    
    // Add video inputs
    videoInputs.forEach(input => {
      command = command.input(input);
    });
    
    // Add background audio if provided
    if (backgroundAudioPath && fs.existsSync(backgroundAudioPath)) {
      command = command.input(backgroundAudioPath);
      
      // Add audio mixing to filter complex
      filterComplex.push(`[${videoInputs.length}:a]volume=${audioVolume}[outa]`);
      
      command = command
        .complexFilter(filterComplex)
        .outputOptions(['-map', '[outv]', '-map', '[outa]']);
    } else {
      command = command
        .complexFilter(filterComplex)
        .outputOptions(['-map', '[outv]']);
    }
    
    // Set output options
    command
      .outputOptions([
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '23',
        '-pix_fmt', 'yuv420p',
        '-shortest'
      ])
      .output(outputPath)
      .on('start', (commandLine: string) => {
        console.log('FFmpeg command:', commandLine);
      })
      .on('progress', (progress: any) => {
        console.log('Processing: ' + progress.percent + '% done');
      })
      .on('end', () => {
        console.log('Video generation completed');
        resolve();
      })
      .on('error', (err: Error) => {
        console.error('FFmpeg error:', err);
        reject(err);
      })
      .run();
  });
}

export function parseScriptIntoSegments(script: string): VideoSegment[] {
  // Split script into lines and filter out empty ones
  const lines = script
    .split(/[.\n]/)
    .map(line => line.trim())
    .filter(line => line.length > 0 && line.length < 100) // Reasonable text length
    .slice(0, 8); // Limit to 8 segments max
  
  // Available video clips (cycle through them)
  const clipPaths = [
    path.join(process.cwd(), 'public/video/assets/clip1.mp4'),
    path.join(process.cwd(), 'public/video/assets/clip2.mp4'),
    path.join(process.cwd(), 'public/video/assets/clip3.mp4'),
  ];
  
  return lines.map((line, index) => ({
    text: line,
    clipPath: clipPaths[index % clipPaths.length],
    duration: 4 // 4 seconds per segment
  }));
}

export function validateAssets(): { valid: boolean; missing: string[] } {
  const requiredAssets = [
    'public/video/assets/clip1.mp4',
    'public/video/assets/clip2.mp4',
    'public/video/assets/clip3.mp4',
    'public/video/assets/bg.mp3'
  ];
  
  const missing: string[] = [];
  
  for (const asset of requiredAssets) {
    const fullPath = path.join(process.cwd(), asset);
    if (!fs.existsSync(fullPath)) {
      missing.push(asset);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing
  };
}
