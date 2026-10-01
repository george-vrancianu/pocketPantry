import { Injectable, PipeTransform } from '@nestjs/common';
import type { z } from 'zod';
import { ApiException } from '../common/api-exception';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  IMAGE_DATA_URL_PATTERN,
  MAX_IMAGE_DATA_URL_LENGTH,
} from './product-scan.schemas';

/**
 * Validates a scan request body. The named image fields get their own stable
 * codes (`scan.image_too_large`, `scan.image_invalid`) so clients can say
 * what is wrong with the photo; everything else is ordinary body validation.
 */
@Injectable()
export class ScanImagePipe<T extends z.ZodType> implements PipeTransform {
  private readonly body: ZodValidationPipe<T>;

  constructor(
    schema: T,
    private readonly imageFields: string[],
  ) {
    this.body = new ZodValidationPipe(schema);
  }

  transform(value: unknown): z.infer<T> {
    if (typeof value === 'object' && value !== null) {
      for (const field of this.imageFields) {
        const image = (value as Record<string, unknown>)[field];
        if (image === undefined || image === null) continue;
        if (
          typeof image === 'string' &&
          image.length > MAX_IMAGE_DATA_URL_LENGTH
        ) {
          throw new ApiException(413, 'scan.image_too_large', { field });
        }
        if (typeof image !== 'string' || !IMAGE_DATA_URL_PATTERN.test(image)) {
          throw new ApiException(400, 'scan.image_invalid', { field });
        }
      }
    }
    return this.body.transform(value);
  }
}
