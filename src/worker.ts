import { app } from './app.js';
import { FeuchRoom } from './feuch-room.js';

type DurableObjectStubLike = { fetch(request: Request): Promise<Response> };
type DurableObjectNamespaceLike = {
  idFromName(name: string): unknown;
  get(id: unknown): DurableObjectStubLike;
};

type WorkerEnv = {
  MISTRAL_API_KEY?: string;
  MISTRAL_MODEL?: string;
  FEUCH_ROOMS?: DurableObjectNamespaceLike;
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
    },
  });
}

function roomCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (value) => alphabet[value % alphabet.length]).join('');
}

function stubFor(env: WorkerEnv, code: string): DurableObjectStubLike | undefined {
  if (!env.FEUCH_ROOMS) return undefined;
  const normalized = code.trim().toUpperCase();
  if (!/^[A-Z2-9]{6}$/.test(normalized)) return undefined;
  return env.FEUCH_ROOMS.get(env.FEUCH_ROOMS.idFromName(normalized));
}

async function handleFeuchLink(request: Request, env: WorkerEnv): Promise<Response> {
  const url = new URL(request.url);
  if (!env.FEUCH_ROOMS) return json({ status: 'unavailable', message: 'FEUCH_ROOMS binding is not configured.' }, 503);

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET, POST, OPTIONS',
        'access-control-allow-headers': 'Content-Type',
      },
    });
  }

  if (request.method === 'POST' && url.pathname === '/feuch-link/room/create') {
    const code = roomCode();
    const stub = stubFor(env, code)!;
    const initUrl = new URL(`/room/${code}/init`, url.origin);
    await stub.fetch(new Request(initUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code }),
    }));
    return json({ status: 'created', code, socketPath: `/feuch-link/room/${code}/socket` }, 201);
  }

  const match = url.pathname.match(/^\/feuch-link\/room\/([A-Za-z2-9]{6})\/(status|socket)$/);
  if (!match) return json({ status: 'not-found' }, 404);

  const code = match[1].toUpperCase();
  const action = match[2];
  const stub = stubFor(env, code);
  if (!stub) return json({ status: 'invalid-room' }, 400);

  const target = new URL(`/room/${code}/${action}`, url.origin);
  target.search = url.search;
  return stub.fetch(new Request(target, request));
}

const worker = {
  async fetch(request: Request, env: WorkerEnv, executionCtx: unknown): Promise<Response> {
    if (new URL(request.url).pathname.startsWith('/feuch-link/')) {
      return handleFeuchLink(request, env);
    }
    return app.fetch(request, env, executionCtx as never);
  },
};

export { FeuchRoom };
export default worker;
