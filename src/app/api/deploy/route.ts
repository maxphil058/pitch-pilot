import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { htmlContent, siteName } = await request.json();
    
    if (!process.env.NETLIFY_TOKEN) {
      return NextResponse.json({ error: 'Netlify token not configured' }, { status: 500 });
    }

    // Create a zip file with the HTML content
    const JSZip = require('jszip');
    const zip = new JSZip();
    zip.file('index.html', htmlContent);
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    // Deploy to Netlify using their API
    const response = await fetch('https://api.netlify.com/api/v1/sites', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NETLIFY_TOKEN}`,
        'Content-Type': 'application/zip',
      },
      body: zipBuffer
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Netlify API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const site = await response.json();
    
    return NextResponse.json({ 
      success: true, 
      url: `https://${site.name}.netlify.app`,
      siteId: site.id 
    });

  } catch (error) {
    console.error('Deploy error:', error);
    return NextResponse.json({ 
      error: 'Failed to deploy site', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
