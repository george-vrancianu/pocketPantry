import { Injectable } from '@nestjs/common';
import { PantryService } from '../pantry/pantry.service';
import { RunningLowService } from '../pantry/running-low.service';
import { ShoppingService } from '../shopping/shopping.service';
import type { VoiceActionDraft } from './voice-actions';
import { pantryAddHandler } from './handlers/pantry-add.handler';
import { pantryRemoveHandler } from './handlers/pantry-remove.handler';
import { pantryRunningLowHandler } from './handlers/pantry-running-low.handler';
import { shoppingAddHandler } from './handlers/shopping-add.handler';
import { handlerKey, type VoiceActionHandler } from './voice-handlers';

/**
 * The (target, op) pairs a Voice Note can act on. A pair with no handler reads
 * as "Didn't understand" until one is registered here; each new op is one
 * handler file plus one line below.
 */
@Injectable()
export class VoiceHandlers {
  private readonly handlers = new Map<string, VoiceActionHandler>();

  constructor(
    shopping: ShoppingService,
    pantry: PantryService,
    runningLow: RunningLowService,
  ) {
    const shoppingAdd = shoppingAddHandler(shopping);
    this.register('shopping', 'add', shoppingAdd);
    this.register('pantry', 'add', pantryAddHandler(pantry));
    this.register('pantry', 'remove', pantryRemoveHandler(pantry));
    this.register(
      'pantry',
      'runningLow',
      pantryRunningLowHandler(pantry, runningLow, shoppingAdd),
    );
  }

  private register(
    target: VoiceActionDraft['target'],
    op: VoiceActionDraft['op'],
    handler: VoiceActionHandler,
  ) {
    this.handlers.set(handlerKey(target, op), handler);
  }

  for(draft: Pick<VoiceActionDraft, 'target' | 'op'>) {
    return this.handlers.get(handlerKey(draft.target, draft.op));
  }
}
