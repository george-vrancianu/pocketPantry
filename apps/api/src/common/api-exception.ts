import { HttpException } from '@nestjs/common';

export type ErrorParams = Record<string, unknown>;

/**
 * Application error. `code` is a stable, machine-readable identifier clients
 * map to their own localized copy; `params` carries the values that copy may
 * interpolate. Never put human-readable text in either.
 */
export class ApiException extends HttpException {
  constructor(
    status: number,
    readonly code: string,
    readonly params: ErrorParams = {},
  ) {
    super({ code, params }, status);
  }
}
