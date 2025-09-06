import { NextRequest } from 'next/server';
import { meshBus } from '@/lib/event-bus';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(encoder.encode('data: {"type":"connected"}\n\n'));

      // Listen for events from meshBus
      const eventHandler = (event: any) => {
        const data = JSON.stringify(event);
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      meshBus.on('event', eventHandler);

      // Set up heartbeat every 25 seconds
      const heartbeat = setInterval(() => {
        try {
          const heartbeatData = JSON.stringify({
            type: 'heartbeat',
            time: new Date().toISOString()
          });
          controller.enqueue(encoder.encode(`data: ${heartbeatData}\n\n`));
        } catch (error) {
          console.error('Heartbeat error:', error);
        }
      }, 25000);

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        meshBus.off('event', eventHandler);
        clearInterval(heartbeat);
        try {
          controller.close();
        } catch (error) {
          // Connection already closed
        }
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
}
