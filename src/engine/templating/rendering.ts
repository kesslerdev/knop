import fm from 'front-matter';
import cons from 'consolidate';
import { promisify } from 'util';
import { readFile } from 'fs';
import { globPromise } from '../../utils/glob';

const readFileAsync = promisify(readFile);

type IndexedObject = { [index:string] : string };
const defaultOptions: TemplateOptions = {
  engine: 'handlebars'
};

export interface TemplateOptions {
  engine: string;
}

export interface TemplateResult {
  readonly attributes: TemplateOptions
  readonly body: string
  readonly bodyBegin: number;
  readonly frontmatter?: string
}

export const parseTemplate = async (str: string): Promise<TemplateResult> => {
  const result = fm<TemplateOptions>(str);

  return {
    ...result,
    attributes: {
      ...defaultOptions,
      ...result.attributes
    }
  };
}

export const renderString = async (engine: string, str: string, options = {}): Promise<string> => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  return cons[engine].render(str, options);
}

export const renderFrontMatter = async (str: string, options = {}): Promise<string> => {
  const result = await parseTemplate(str);
  const { engine } = result.attributes;

  return renderString(engine, result.body, {
    ...options,
    fm: result.attributes
  });
}

export const renderGlob = async (glob: string, options = {}): Promise<IndexedObject> => {
  const paths = await globPromise(glob)
  const rendered: IndexedObject = {};

  for (const path of paths) {
    rendered[path] = await renderFrontMatter(await readFileAsync(path,'utf8'), options)
  }

  return rendered;
}
