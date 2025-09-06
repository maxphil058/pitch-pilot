import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import { configureFfmpeg } from "@/lib/video/ffmpeg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const posterPath = "/tmp/generated_v2.jpg";
    const videoPath = "/tmp/generated_v2.mp4";
    
    // Check if poster already exists
    if (fs.existsSync(posterPath)) {
      const file = fs.createReadStream(posterPath);
      const stat = fs.statSync(posterPath);
      
      return new NextResponse(file as any, {
        headers: {
          'Content-Type': 'image/jpeg',
          'Content-Length': stat.size.toString(),
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }
    
    // Check if video exists to extract frame
    if (!fs.existsSync(videoPath)) {
      return NextResponse.json(
        { error: 'Video file not found' },
        { status: 404 }
      );
    }

    // Extract frame at 1 second
    const ff = configureFfmpeg();
    
    await new Promise<void>((resolve, reject) => {
      ff()
        .input(videoPath)
        .seekInput(1)
        .frames(1)
        .outputOptions(['-q:v', '2'])
        .output(posterPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run();
    });

    // Serve the extracted frame
    if (fs.existsSync(posterPath)) {
      const file = fs.createReadStream(posterPath);
      const stat = fs.statSync(posterPath);
      
      return new NextResponse(file as any, {
        headers: {
          'Content-Type': 'image/jpeg',
          'Content-Length': stat.size.toString(),
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to extract poster frame' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error generating V2 poster:', error);
    return NextResponse.json(
      { error: 'Failed to generate poster' },
      { status: 500 }
    );
  }
}
