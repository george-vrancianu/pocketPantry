import { Injectable, PipeTransform } from '@nestjs/common';
import type { z } from 'zod';
import { ApiException } from '../common/api-exception';
import { toValidationIssues } from '../common/zod-validation.pipe';

/**
 * Validates a scan request body against its schema, which owns the image rules
 * (`imageDataUrlSchema`). A present image that breaks them gets a stable code
 * (`scan.image_too_large`, `scan.image_invalid`) so clients can say what is
 * wrong with the photo; a missing image and everything else is ordinary body
 * validation (`validation_failed`).
 */
@Injectable()
export class ScanImagePipe<T extends z.ZodType> implements PipeTransform {
  constructor(
    private readonly schema: T,
    private readonly imageFields: string[],
  ) {}

  transform(value: unknown): z.infer<T> {
    const result = this.schema.safeParse(value);
    if (result.success) return result.data;

    const body =
      typeof value === 'object' && value !== null
        ? (value as Record<string, unknown>)
        : {};
    const broken = this.imageFields.filter(
      (field) =>
        body[field] != null &&
        result.error.issues.some((issue) => issue.path[0] === field),
    );
    const tooLarge = broken.find((field) =>
      result.error.issues.some(
        (issue) => issue.path[0] === field && issue.code === 'too_big',
      ),
    );
    if (tooLarge) {
      throw new ApiException(413, 'scan.image_too_large', { field: tooLarge });
    }
    if (broken.length > 0) {
      throw new ApiException(400, 'scan.image_invalid', { field: broken[0] });
    }
    throw new ApiException(400, 'validation_failed', {
      issues: toValidationIssues(result.error),
    });
  }
}
