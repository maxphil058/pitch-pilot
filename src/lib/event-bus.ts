import { EventEmitter } from 'events';

interface MeshEvent {
  topic: string;
  payload: any;
  time: string;
}

class MeshBus extends EventEmitter {
  emitEvent(event: MeshEvent) {
    this.emit('event', event);
  }
}

// Singleton instance
export const meshBus = new MeshBus();
