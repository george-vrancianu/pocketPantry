import { Injectable } from '@nestjs/common';
import { ShoppingService } from '../shopping/shopping.service';
import type { VoiceActionDraft } from './voice-actions';
import { shoppingAddHandler } from './handlers/shopping-add.handler';
import { shoppingCheckHandler } from './handlers/shopping-check.handler';
import { shoppingRemoveHandler } from './handlers/shopping-remove.handler';
import { shoppingSetQuantityHandler } from './handlers/shopping-set-quantity.handler';
import { shoppingUncheckHandler } from './handlers/shopping-uncheck.handler';
import { handlerKey, type VoiceActionHandler } from './voice-handlers';

/**
 * The (target, op) pairs a Voice Note can act on. A pair with no handler reads
 * as "Didn't understand" until one is registered here; each new op is one
 * handler file plus one line below.
 */
@Injectable()
export class VoiceHandlers {
  private readonly handlers = new Map<string, VoiceActionHandler>();

  constructor(shopping: ShoppingService) {
    this.register('shopping', 'add', shoppingAddHandler(shopping));
    this.register('shopping', 'check', shoppingCheckHandler(shopping));
    this.register('shopping', 'uncheck', shoppingUncheckHandler(shopping));
    this.register('shopping', 'remove', shoppingRemoveHandler(shopping));
    this.register(
      'shopping',
      'setQuantity',
      shoppingSetQuantityHandler(shopping),
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
