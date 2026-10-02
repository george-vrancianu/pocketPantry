/** The error and its `cause` chain: Drizzle wraps the node-postgres error. */
function causeChain(error: unknown): object[] {
  const chain: object[] = [];
  let current: unknown = error;
  while (current && typeof current === 'object') {
    chain.push(current);
    current = 'cause' in current ? current.cause : undefined;
  }
  return chain;
}

/** Whether the error (or one it wraps) carries this Postgres SQLSTATE code. */
export function hasPgCode(error: unknown, code: string): boolean {
  return causeChain(error).some((e) => 'code' in e && e.code === code);
}

/** The name of the Postgres constraint the error (or one it wraps) violated. */
export function pgConstraint(error: unknown): string | undefined {
  for (const e of causeChain(error)) {
    if ('constraint' in e && typeof e.constraint === 'string') {
      return e.constraint;
    }
  }
  return undefined;
}
