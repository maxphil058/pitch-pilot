import { meshBus } from './event-bus';

interface PublishEventParams {
  topic: string;
  payload: any;
}

export async function publishEvent({ topic, payload }: PublishEventParams) {
  const timestamp = new Date().toISOString();
  
  // Always mirror to in-memory bus first (for demo functionality)
  meshBus.emitEvent({
    topic,
    payload,
    time: timestamp
  });

  // Attempt to publish to Solace REST API
  try {
    const solaceHost = process.env.SOLACE_HOST;
    const solacePort = process.env.SOLACE_REST_PORT;
    const solaceUsername = process.env.SOLACE_USERNAME;
    const solacePassword = process.env.SOLACE_PASSWORD;
    const solaceMsgVpn = process.env.SOLACE_MSG_VPN;

    if (!solaceHost || !solacePort || !solaceUsername || !solacePassword || !solaceMsgVpn) {
      console.warn('Solace configuration incomplete, using in-memory bus only');
      return;
    }

    const url = `https://${solaceHost}:${solacePort}/TOPIC/${topic}`;
    const credentials = Buffer.from(`${solaceUsername}:${solacePassword}`).toString('base64');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`,
        'Solace-Message-VPN': solaceMsgVpn,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.warn(`Solace publish failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.warn('Solace publish error:', error);
  }
}
