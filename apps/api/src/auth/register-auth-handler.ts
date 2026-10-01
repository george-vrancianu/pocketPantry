import type { FastifyInstance } from 'fastify';
import { fromNodeHeaders } from 'better-auth/node';
import type { AuthInstance } from './auth.types';

/**
 * better-auth errors are `{ code, message }` with a library-authored English
 * message. Keep the stable code and drop the message so this surface follows
 * the same `{ code, params }` convention as the rest of the API.
 */
export function toApiErrorBody(text: string): string {
  let code = 'auth.error';
  try {
    const parsed: unknown = JSON.parse(text);
    if (
      parsed &&
      typeof parsed === 'object' &&
      'code' in parsed &&
      typeof parsed.code === 'string'
    ) {
      code = `auth.${parsed.code.toLowerCase()}`;
    }
  } catch {
    // Non-JSON error body: fall through to the generic code.
  }
  return JSON.stringify({ code, params: {} });
}

export function registerAuthHandler(
  fastify: FastifyInstance,
  auth: AuthInstance,
): void {
  fastify.route({
    method: ['GET', 'POST'],
    url: '/api/auth/*',
    async handler(request, reply) {
      const origin = `${request.protocol}://${request.headers.host ?? 'localhost'}`;
      const url = new URL(request.url, origin);
      const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
      const headers = fromNodeHeaders(request.raw.headers);
      if (hasBody && request.body !== undefined) {
        headers.set('content-type', 'application/json');
      }
      const authRequest = new Request(url, {
        method: request.method,
        headers,
        body:
          hasBody && request.body !== undefined
            ? JSON.stringify(request.body)
            : undefined,
      });
      const response = await auth.handler(authRequest);

      reply.code(response.status);
      response.headers.forEach((value, key) => {
        if (key !== 'set-cookie') reply.header(key, value);
      });
      const cookies = response.headers.getSetCookie();
      if (cookies.length > 0) reply.header('set-cookie', cookies);

      if (!response.body || response.status === 204) return reply.send();
      const text = await response.text();
      if (response.status >= 400) {
        return reply
          .header('content-type', 'application/json; charset=utf-8')
          .send(toApiErrorBody(text));
      }
      return reply.send(text);
    },
  });
}
