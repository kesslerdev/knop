import { omit, omitBy, isUndefined, transform, isObject, isEqual } from 'lodash';
import { KubeObject } from '../types';

export const lastConfigAnnotation = process.env.LAST_CONFIG_ANNOTATION
  || "knop.skimia.org/last-applied-configuration";

export const difference = (object: any, base: any) : any => {
  function changes(object: any, base: any) : void {
    return transform(object, function (result: any, value: any, key: any) {
      if (!isEqual(value, base[key])) {
        result[key] = (isObject(value) && isObject(base[key])) ? changes(value, base[key]) : value;
      }
    });
  }
  return changes(object, base);
}

export const inferLastConfig = (object: KubeObject): Partial<KubeObject> => {
  const { status, ...restObj } = object;

  const { annotations, name, namespace, labels } = restObj.metadata;

  const obj = {
    ...restObj,
    metadata: omitBy({
      annotations: omit(
        annotations, [
        "kubectl.kubernetes.io/last-applied-configuration",
        lastConfigAnnotation
      ]
      ),
      name,
      namespace,
      labels
    }, isUndefined),
  };

  return obj;
}

export const differences = (object: KubeObject): Partial<KubeObject> => {
  const annotation = object?.metadata?.annotations?.[lastConfigAnnotation];
  if (!annotation) {
    return inferLastConfig(object);
  }

  const obj = JSON.parse(annotation);

  const lastConf = inferLastConfig(object);

  return difference(lastConf, obj);
}

export const isLastConfig = (object: KubeObject): boolean => {
  const diffs = differences(object);

  return Object.keys(diffs).length === 0;
}


