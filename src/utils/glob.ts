import glob from 'glob';

export const globPromise = (pattern: string, options?: glob.IOptions): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    glob(pattern, options, (err, files) => err === null ? resolve(files) : reject(err))
  })
}
