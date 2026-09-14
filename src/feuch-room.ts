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
type BinaryChoice = 'YES' | 'NO';

type RoomMeta = {
  code: string;
  createdAt: string;
  participants: ParticipantRole[];
};

type SessionState = {
  totalTrials: number;
  trial: number;
  target: BinaryChoice | null;
  guess: BinaryChoice | null;
  score: number;
  active: boolean;
  completed: boolean;
};

type ClientMessage = {
  type?: string;
  payload?: unknown;
  trial?: number;
  sentAt?: number;
};

const DEFAULT_TRIALS = 20;

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

function randomChoice(): BinaryChoice {
  const byte = new Uint8Array(1);
  crypto.getRandomValues(byte);
  return (byte[0] ?? 0) % 2 === 0 ? 'YES' : 'NO';
}

function parseChoice(payload: unknown): BinaryChoice | undefined {
  if (!payload || typeof payload !== 'object') return undefined;
  const value = (payload as { choice?: unknown; guess?: unknown }).choice ?? (payload as { guess?: unknown }).guess;
  if (typeof value !== 'string') return undefined;
  const normalized = value.toUpperCase();
  return normalized === 'YES' || normalized === 'NO' ? normalized : undefined;
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
      const session = await this.state.storage.get<SessionState>('session');
      const sockets = this.state.getWebSockets();
      const roles = [...new Set(sockets.map(attachmentRole).filter((role): role is ParticipantRole => Boolean(role)))];
      return json({
        status: meta ? 'ready' : 'uninitialized',
        room: meta ?? null,
        connected: roles,
        participantCount: roles.length,
        session: session ? this.publicSession(session) : null,
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
      void this.sendSnapshot(server, role);
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

    if (type === 'session.start') {
      if (role !== 'A') return this.sendError(socket, 'ONLY_A_CAN_START');
      const connected = new Set(this.state.getWebSockets().map(attachmentRole));
      if (!connected.has('A') || !connected.has('B')) return this.sendError(socket, 'BOTH_PARTICIPANTS_REQUIRED');
      const requested = typeof parsed.payload === 'object' && parsed.payload
        ? Number((parsed.payload as { totalTrials?: unknown }).totalTrials)
        : DEFAULT_TRIALS;
      const totalTrials = Number.isInteger(requested) && requested >= 5 && requested <= 50 ? requested : DEFAULT_TRIALS;
      const session: SessionState = { totalTrials, trial: 0, target: null, guess: null, score: 0, active: true, completed: false };
      await this.state.storage.put('session', session);
      this.broadcast({ type: 'session.started', totalTrials, serverAt: Date.now() });
      await this.beginNextTrial();
      return;
    }

    if (type === 'trial.next') {
      if (role !== 'A') return this.sendError(socket, 'ONLY_A_CAN_ADVANCE');
      const session = await this.state.storage.get<SessionState>('session');
      if (!session?.active || session.completed) return this.sendError(socket, 'NO_ACTIVE_SESSION');
      if (session.target !== null && session.guess === null) return this.sendError(socket, 'CURRENT_TRIAL_NOT_GUESSED');
      await this.beginNextTrial();
      return;
    }

    if (type === 'trial.guess') {
      if (role !== 'B') return this.sendError(socket, 'ONLY_B_CAN_GUESS');
      const guess = parseChoice(parsed.payload);
      if (!guess) return this.sendError(socket, 'INVALID_GUESS');
      const session = await this.state.storage.get<SessionState>('session');
      if (!session?.active || session.completed || !session.target) return this.sendError(socket, 'NO_ACTIVE_TRIAL');
      if (session.guess) return this.sendError(socket, 'GUESS_ALREADY_RECORDED');
      const correct = guess === session.target;
      const updated: SessionState = { ...session, guess, score: session.score + (correct ? 1 : 0) };
      await this.state.storage.put('session', updated);
      this.broadcast({
        type: 'trial.result',
        trial: updated.trial,
        totalTrials: updated.totalTrials,
        target: updated.target,
        guess,
        correct,
        score: updated.score,
        serverAt: Date.now(),
      });
      return;
    }

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

  private async beginNextTrial(): Promise<void> {
    const session = await this.state.storage.get<SessionState>('session');
    if (!session?.active || session.completed) return;
    if (session.trial >= session.totalTrials) {
      const completed: SessionState = { ...session, active: false, completed: true, target: null, guess: null };
      await this.state.storage.put('session', completed);
      this.broadcast({ type: 'session.completed', totalTrials: completed.totalTrials, score: completed.score, serverAt: Date.now() });
      return;
    }

    const next: SessionState = {
      ...session,
      trial: session.trial + 1,
      target: randomChoice(),
      guess: null,
    };
    await this.state.storage.put('session', next);

    for (const socket of this.state.getWebSockets()) {
      const role = attachmentRole(socket);
      if (!role) continue;
      const payload = role === 'A'
        ? { type: 'trial.started', trial: next.trial, totalTrials: next.totalTrials, target: next.target, serverAt: Date.now() }
        : { type: 'trial.started', trial: next.trial, totalTrials: next.totalTrials, serverAt: Date.now() };
      try { socket.send(JSON.stringify(payload)); } catch { /* stale socket */ }
    }
  }

  private publicSession(session: SessionState) {
    return {
      totalTrials: session.totalTrials,
      trial: session.trial,
      score: session.score,
      active: session.active,
      completed: session.completed,
      guessed: session.guess !== null,
    };
  }

  private async sendSnapshot(socket: WebSocket, role: ParticipantRole): Promise<void> {
    const session = await this.state.storage.get<SessionState>('session');
    if (!session) return;
    socket.send(JSON.stringify({
      type: 'session.snapshot',
      ...this.publicSession(session),
      ...(role === 'A' && session.active && session.target ? { target: session.target } : {}),
    }));
  }

  private sendError(socket: WebSocket, code: string): void {
    socket.send(JSON.stringify({ type: 'error', code, serverAt: Date.now() }));
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
