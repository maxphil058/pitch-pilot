# Video Assets Required

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

### Option 3: Install ffmpeg and run this script again
```bash
# macOS
brew install ffmpeg

# Then run:
node scripts/create-test-video-assets.js
```

The video generation system will work once these assets are in place.
