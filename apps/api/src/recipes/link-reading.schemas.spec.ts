import { linkReadingJsonSchema } from './link-reading.schemas';

/** OpenAI strict structured output needs every property key listed in `required`, at every object level. */
function assertAllRequired(node: unknown, path: string): void {
  if (Array.isArray(node)) {
    node.forEach((item, i) => assertAllRequired(item, `${path}[${i}]`));
    return;
  }
  if (typeof node !== 'object' || node === null) return;
  const schema = node as Record<string, unknown>;
  if (schema.properties && typeof schema.properties === 'object') {
    const keys = Object.keys(schema.properties);
    expect(
      [...((schema.required as string[] | undefined) ?? [])].sort(),
    ).toEqual([...keys].sort());
  }
  for (const [key, value] of Object.entries(schema)) {
    assertAllRequired(value, `${path}.${key}`);
  }
}

describe('linkReadingJsonSchema', () => {
  it('lists every property as required, nested objects included', () => {
    expect(Object.keys(linkReadingJsonSchema.properties ?? {})).toContain(
      'sourceLanguage',
    );
    assertAllRequired(linkReadingJsonSchema, '$');
  });
});
