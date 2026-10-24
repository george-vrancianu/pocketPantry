import { extractJsonLdRecipe } from './json-ld-recipe';

const page = (...blocks: string[]) =>
  `<html><head>${blocks
    .map((b) => `<script type="application/ld+json">${b}</script>`)
    .join('')}</head><body>Hi</body></html>`;

describe('extractJsonLdRecipe', () => {
  it('finds a top-level Recipe and drops bulky keys', () => {
    const json = extractJsonLdRecipe(
      page('{"@type":"Recipe","name":"Soup","image":"x.jpg"}'),
    );
    expect(JSON.parse(json!)).toEqual({ '@type': 'Recipe', name: 'Soup' });
  });

  it('finds a Recipe inside @graph, in an array, or with a typed array', () => {
    expect(
      extractJsonLdRecipe(
        page(
          '{"@graph":[{"@type":"WebSite"},{"@type":["Thing","Recipe"],"name":"A"}]}',
        ),
      ),
    ).toContain('"A"');
    expect(
      extractJsonLdRecipe(page('[{"@type":"schema:Recipe","name":"B"}]')),
    ).toContain('"B"');
  });

  it('skips invalid blocks and other scripts, in any attribute order', () => {
    const html =
      '<script>var a=1</script><script type="application/ld+json">{oops</script>' +
      `<script data-x='1' TYPE='application/ld+json' id=a>{"@type":"Recipe","name":"C"}</script>`;
    expect(extractJsonLdRecipe(html)).toContain('"C"');
  });

  it('is null without a Recipe', () => {
    expect(extractJsonLdRecipe(page('{"@type":"Article"}'))).toBeNull();
    expect(extractJsonLdRecipe('<p>no scripts</p>')).toBeNull();
  });
});
