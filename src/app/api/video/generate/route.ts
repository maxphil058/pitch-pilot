import { NextRequest, NextResponse } from 'next/server';
import { generateVideo, parseScriptIntoSegments, validateAssets } from '@/lib/video/ffmpeg';
import { publishEvent } from '@/lib/solace';
import path from 'path';
import fs from 'fs';

export const runtime = 'nodejs';

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

    // Publish start event
    await publishEvent({
      topic: 'pitchpilot/video/progress',
      payload: { stage: 'start', message: 'Starting video generation...' }
    });

    // Validate that video assets exist
    const assetValidation = validateAssets();
    if (!assetValidation.valid) {
      const errorMessage = `Missing video assets: ${assetValidation.missing.join(', ')}. Please add MP4 clips and bg.mp3 to public/video/assets/`;
      
      await publishEvent({
        topic: 'pitchpilot/video/progress',
        payload: { stage: 'error', message: errorMessage }
      });

      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    // Parse script into video segments
    await publishEvent({
      topic: 'pitchpilot/video/progress',
      payload: { stage: 'parsing', message: 'Parsing script into segments...' }
    });

    const segments = parseScriptIntoSegments(script);
    
    if (segments.length === 0) {
      const errorMessage = 'No valid segments found in script';
      
      await publishEvent({
        topic: 'pitchpilot/video/progress',
        payload: { stage: 'error', message: errorMessage }
      });

      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    // Set up output path
    const outputPath = path.join(process.cwd(), 'public/video/generated.mp4');
    const backgroundAudioPath = path.join(process.cwd(), 'public/video/assets/bg.mp3');

    // Remove existing generated video if it exists
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }

    // Generate video
    await publishEvent({
      topic: 'pitchpilot/video/progress',
      payload: { 
        stage: 'rendering', 
        message: `Rendering video with ${segments.length} segments...` 
      }
    });

    await generateVideo({
      segments,
      outputPath,
      backgroundAudioPath: fs.existsSync(backgroundAudioPath) ? backgroundAudioPath : undefined,
      audioVolume: 0.2
    });

    // Verify the output file was created
    if (!fs.existsSync(outputPath)) {
      const errorMessage = 'Video generation completed but output file not found';
      
      await publishEvent({
        topic: 'pitchpilot/video/progress',
        payload: { stage: 'error', message: errorMessage }
      });

      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    // Success - publish completion event
    await publishEvent({
      topic: 'pitchpilot/video/done',
      payload: { url: '/video/generated.mp4', segments: segments.length }
    });

    return NextResponse.json({
      url: '/video/generated.mp4',
      segments: segments.length,
      message: 'Video generated successfully'
    });

  } catch (error) {
    console.error('Video generation error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    await publishEvent({
      topic: 'pitchpilot/video/progress',
      payload: { stage: 'error', message: errorMessage }
    });

    return NextResponse.json(
      { error: 'Video generation failed', details: errorMessage },
      { status: 500 }
    );
  }
}
