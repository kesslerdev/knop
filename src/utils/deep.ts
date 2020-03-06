import _ from 'lodash';

export const deepKeys = (obj: any): string[] => {
  const result = {}

  function flatten(obj: any, prefix = ''): any {
    _.forEach(obj, (value, key) => {
      if (_.isObject(value)) {
        flatten(value, `${prefix}${key}.`)
      } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        result[`${prefix}${key.replace('.','__')}`] = value
      }
    })
  }

  flatten(obj)

  return Object.keys(result);
}


export const deepClearEmpties = (o:any):any => {
  o = _.clone(o);
  for (const k in o) {
    if (!o[k] || typeof o[k] !== "object") {
      continue // If null or not an object, skip to the next iteration
    }

    // The property is an object
    o[k] = deepClearEmpties(o[k]); // <-- Make a recursive call on the nested object
    if (Object.keys(o[k]).length === 0) {
      delete o[k]; // The object had no properties, so delete that property
    }
  }

  return o;
}
