import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Return API liveness' })
  check() {
    return { status: 'ok', service: 'pocket-pantry-api' } as const;
  }
}
