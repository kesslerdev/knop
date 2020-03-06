import { renderString } from "../rendering";
const engine = "handlebars";
describe('render', () => {

  test('render string', async () => {
    expect(await renderString(
      engine, '{{ name }}',
      { name: "kessler" }
    )).toBe("kessler");

    expect(await renderString(
      engine, 'salut {{ name }}'
    )).toBe("salut ");
  })
});
