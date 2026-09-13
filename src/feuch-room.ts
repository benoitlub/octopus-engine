type DurableObjectStorageLike = {
  get<T = unknown>(key: string): Promise<T | undefined>;
  put<T = unknown>(key: string, value: T): Promise<void>;
};

type DurableObjectStateLike = {
  storage: DurableObjectStorageLike;
  acceptWebSocket(socket: WebSocket): void;
  getWebSockets(): WebSocket[];
};

type ParticipantRole = 'A' | 'B';

type RoomMeta = {
  code: string;
  createdAt: string;
  participants: ParticipantRole[];
};

type ClientMessage = {
  type?: string;
  payload?: unknown;
  trial?: number;
  sentAt?: number;
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function parseRole(url: URL): ParticipantRole | undefined {
  const role = url.searchParams.get('role')?.toUpperCase();
  return role === 'A' || role === 'B' ? role : undefined;
}

function attachmentRole(socket: WebSocket): ParticipantRole | undefined {
  const attachment = (socket as WebSocket & { deserializeAttachment?: () => unknown }).deserializeAttachment?.();
  if (!attachment || typeof attachment !== 'object') return undefined;
  const role = (attachment as { role?: unknown }).role;
  return role === 'A' || role === 'B' ? role : undefined;
}

export class FeuchRoom {
  constructor(private readonly state: DurableObjectStateLike) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname.endsWith('/init')) {
      const body = await request.json().catch(() => ({})) as { code?: unknown };
      const code = typeof body.code === 'string' ? body.code.toUpperCase() : 'UNKNOWN';
      const existing = await this.state.storage.get<RoomMeta>('meta');
      if (!existing) {
        await this.state.storage.put<RoomMeta>('meta', { code, createdAt: new Date().toISOString(), participants: [] });
      }
      return json({ status: 'ready', code });
    }

    if (request.method === 'GET' && url.pathname.endsWith('/status')) {
      const meta = await this.state.storage.get<RoomMeta>('meta');
      const sockets = this.state.getWebSockets();
      const roles = [...new Set(sockets.map(attachmentRole).filter((role): role is ParticipantRole => Boolean(role)))];
      return json({
        status: meta ? 'ready' : 'uninitialized',
        room: meta ?? null,
        connected: roles,
        participantCount: roles.length,
      });
    }

    if (request.method === 'GET' && url.pathname.endsWith('/socket')) {
      const upgrade = request.headers.get('Upgrade');
      if (upgrade?.toLowerCase() !== 'websocket') return json({ status: 'failed', message: 'WebSocket upgrade required.' }, 426);

      const role = parseRole(url);
      if (!role) return json({ status: 'failed', message: 'Query parameter role=A or role=B is required.' }, 400);

      const existingRole = this.state.getWebSockets().some((socket) => attachmentRole(socket) === role);
      if (existingRole) return json({ status: 'failed', message: `Role ${role} is already connected.` }, 409);

      const pair = new WebSocketPair();
      const client = pair[0];
      const server = pair[1];
      (server as WebSocket & { serializeAttachment?: (value: unknown) => void }).serializeAttachment?.({ role });
      this.state.acceptWebSocket(server);
      this.broadcast({ type: 'participant.joined', role, at: Date.now() }, server);
      return new Response(null, { status: 101, webSocket: client } as ResponseInit & { webSocket: WebSocket });
    }

    return json({ status: 'not-found' }, 404);
  }

  async webSocketMessage(socket: WebSocket, message: string | ArrayBuffer): Promise<void> {
    const role = attachmentRole(socket);
    if (!role) return;

    let parsed: ClientMessage;
    try {
      parsed = JSON.parse(typeof message === 'string' ? message : new TextDecoder().decode(message)) as ClientMessage;
    } catch {
      socket.send(JSON.stringify({ type: 'error', code: 'INVALID_JSON' }));
      return;
    }

    const type = typeof parsed.type === 'string' ? parsed.type : 'event';
    const relay = {
      type,
      from: role,
      payload: parsed.payload ?? null,
      ...(typeof parsed.trial === 'number' ? { trial: parsed.trial } : {}),
      sentAt: typeof parsed.sentAt === 'number' ? parsed.sentAt : Date.now(),
      serverAt: Date.now(),
    };
    this.broadcast(relay, socket);
    socket.send(JSON.stringify({ type: 'ack', event: type, serverAt: relay.serverAt }));
  }

  webSocketClose(socket: WebSocket, code: number, reason: string): void {
    const role = attachmentRole(socket);
    if (role) this.broadcast({ type: 'participant.left', role, code, reason, at: Date.now() }, socket);
  }

  webSocketError(socket: WebSocket): void {
    const role = attachmentRole(socket);
    if (role) this.broadcast({ type: 'participant.error', role, at: Date.now() }, socket);
  }

  private broadcast(payload: unknown, except?: WebSocket): void {
    const text = JSON.stringify(payload);
    for (const socket of this.state.getWebSockets()) {
      if (socket === except) continue;
      try { socket.send(text); } catch { /* stale socket */ }
    }
  }
}

declare class WebSocketPair {
  0: WebSocket;
  1: WebSocket;
  constructor();
}
