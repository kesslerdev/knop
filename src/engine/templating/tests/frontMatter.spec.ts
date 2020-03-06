import { parseTemplate, renderFrontMatter } from "../rendering";

const tpl1 = `---
engine: twig
---
 
BODY`;

const tpl2 = `---
---
 
BODY`;
const tpl3 = `BODY`;

const tpl4 = `---
name: kessler
---
 
salut {{fm.name}}`;
describe('parse', () => {

  test('default engine', async () => {
    expect(await parseTemplate(tpl2)).toMatchObject({
      attributes: {
        engine: 'handlebars'
      },
      body: "BODY"
    });
    expect(await parseTemplate(tpl3)).toMatchObject({
      attributes: {
        engine: 'handlebars'
      },
      body: "BODY"
    });
    expect(await parseTemplate(tpl1)).toMatchObject({
      attributes: {
        engine: 'twig'
      },
      body: "BODY"
    });
  })
});

describe('render', () => {
  test('use fm (frontmatter) variables with default engine', async () => {
    expect(await renderFrontMatter(tpl4)).toBe("salut kessler");
  })
})
