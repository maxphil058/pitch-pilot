import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface DeployRequest {
  html: string;
  assets?: Array<{ path: string; content: string | ArrayBuffer | Uint8Array }>;
  siteName?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { html, assets, siteName }: DeployRequest = await request.json();

    if (!html) {
      return NextResponse.json({ error: 'HTML content is required' }, { status: 400 });
    }

    // Create data URL for immediate viewing
    const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
    
    // Try Netlify deployment in background (don't await)
    if (process.env.NETLIFY_TOKEN) {
      deployToNetlify(html, siteName, assets).catch(error => {
        console.error('Background Netlify deployment failed:', error);
      });
    }
    
    return NextResponse.json({ 
      url: dataUrl,
      siteId: `data-${Date.now()}`,
      deployId: `deploy-${Date.now()}`,
      message: 'Showing preview now, deploying to Netlify in background...'
    });

  } catch (error) {
    console.error('Deploy error:', error);
    return NextResponse.json({ 
      error: 'Failed to deploy site', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Background deployment function
async function deployToNetlify(html: string, siteName?: string, assets?: Array<{ path: string; content: string | ArrayBuffer | Uint8Array }>) {
  const siteData = {
    name: siteName || `pitchpilot-${Date.now().toString(36)}`,
    files: {
      'index.html': html
    }
  };

  if (assets && assets.length > 0) {
    for (const asset of assets) {
      siteData.files[asset.path] = asset.content;
    }
  }

  const response = await fetch('https://api.netlify.com/api/v1/sites', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NETLIFY_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(siteData)
  });

  if (response.ok) {
    const site = await response.json();
    console.log('Background Netlify deployment successful:', site.ssl_url || site.url);
  } else {
    throw new Error(`Netlify deployment failed: ${response.status}`);
  }
}
