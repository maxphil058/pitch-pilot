const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const assetsDir = path.join(__dirname, '../public/video/assets');

// Ensure directory exists
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

console.log('Creating test video assets...');

// Create simple placeholder video files using ffmpeg-static
try {
  // Use the ffmpeg-static binary from node_modules
  const ffmpegPath = path.join(__dirname, '../node_modules/ffmpeg-static/ffmpeg');
  
  if (fs.existsSync(ffmpegPath)) {
    console.log('Using ffmpeg-static binary');
    
    // Create 3 simple colored video clips with audio
    const clips = [
      { color: 'blue', name: 'clip1.mp4', freq: 440 },
      { color: 'green', name: 'clip2.mp4', freq: 523 },
      { color: 'red', name: 'clip3.mp4', freq: 659 }
    ];
    
    clips.forEach((clip) => {
      const outputPath = path.join(assetsDir, clip.name);
      const command = `"${ffmpegPath}" -f lavfi -i color=c=${clip.color}:size=640x480:duration=4 -f lavfi -i sine=frequency=${clip.freq}:duration=4 -c:v libx264 -c:a aac -t 4 -pix_fmt yuv420p -y "${outputPath}"`;
      
      console.log(`Creating ${clip.name}...`);
      execSync(command, { stdio: 'inherit' });
    });
    
    // Create background audio (simple sine wave)
    const bgAudioPath = path.join(assetsDir, 'bg.mp3');
    const audioCommand = `"${ffmpegPath}" -f lavfi -i sine=frequency=220:duration=20 -c:a mp3 -b:a 128k -y "${bgAudioPath}"`;
    
    console.log('Creating background audio...');
    execSync(audioCommand, { stdio: 'inherit' });
    
    console.log('✅ Test video assets created successfully!');
    console.log('Files created:');
    console.log('- public/video/assets/clip1.mp4 (blue, 4s)');
    console.log('- public/video/assets/clip2.mp4 (green, 4s)');
    console.log('- public/video/assets/clip3.mp4 (red, 4s)');
    console.log('- public/video/assets/bg.mp3 (background music, 20s)');
    
  } else {
    throw new Error('ffmpeg-static binary not found');
  }
  
} catch (error) {
  console.log('⚠️  Could not create video assets automatically');
  console.log('Error:', error.message);
  
  // Create instruction files for manual asset creation
  const instructions = `# Video Assets Required

To test video generation, you need to add these files to public/video/assets/:

## Required Files:
- clip1.mp4 (3-5 seconds, any content)
- clip2.mp4 (3-5 seconds, any content) 
- clip3.mp4 (3-5 seconds, any content)
- bg.mp3 (background music, 10-30 seconds)

## Quick Setup Options:

### Option 1: Use online tools
1. Visit https://www.kapwing.com/tools/blank-video
2. Create 3 short colored videos (3-5 seconds each)
3. Download as MP4 and rename to clip1.mp4, clip2.mp4, clip3.mp4

### Option 2: Use existing videos
1. Find any 3 short MP4 files on your system
2. Copy them to public/video/assets/ and rename appropriately
3. Add any MP3 file as bg.mp3

### Option 3: Install system ffmpeg
\`\`\`bash
# macOS
brew install ffmpeg

# Then create simple test videos:
ffmpeg -f lavfi -i color=c=blue:size=640x480:duration=4 -f lavfi -i sine=frequency=440:duration=4 -c:v libx264 -c:a aac -t 4 -pix_fmt yuv420p public/video/assets/clip1.mp4
ffmpeg -f lavfi -i color=c=green:size=640x480:duration=4 -f lavfi -i sine=frequency=523:duration=4 -c:v libx264 -c:a aac -t 4 -pix_fmt yuv420p public/video/assets/clip2.mp4
ffmpeg -f lavfi -i color=c=red:size=640x480:duration=4 -f lavfi -i sine=frequency=659:duration=4 -c:v libx264 -c:a aac -t 4 -pix_fmt yuv420p public/video/assets/clip3.mp4
ffmpeg -f lavfi -i sine=frequency=220:duration=20 -c:a mp3 -b:a 128k public/video/assets/bg.mp3
\`\`\`

The video generation system will work once these assets are in place.
`;

  fs.writeFileSync(path.join(assetsDir, 'README.md'), instructions);
  console.log('📝 Created setup instructions in public/video/assets/README.md');
}
