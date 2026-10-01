import { Injectable, PipeTransform } from '@nestjs/common';
import type { z } from 'zod';
import { ApiException } from './api-exception';

const PARAM_KEYS = [
  'expected',
  'format',
  'inclusive',
  'keys',
  'maximum',
  'minimum',
  'multipleOf',
  'origin',
  'values',
] as const;

export type ValidationIssue = {
  path: string;
  code: string;
  params: Record<string, unknown>;
};

export function toValidationIssues(error: z.ZodError): ValidationIssue[] {
  return error.issues.map((issue) => {
    const raw = issue as unknown as Record<string, unknown>;
    const params: Record<string, unknown> = {};
    for (const key of PARAM_KEYS) {
      if (raw[key] !== undefined) params[key] = raw[key];
    }
    return { path: issue.path.join('.'), code: issue.code, params };
  });
}

@Injectable()
export class ZodValidationPipe<T extends z.ZodType> implements PipeTransform {
  constructor(private readonly schema: T) {}

  transform(value: unknown): z.infer<T> {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new ApiException(400, 'validation_failed', {
        issues: toValidationIssues(result.error),
      });
    }
    return result.data;
  }
}
