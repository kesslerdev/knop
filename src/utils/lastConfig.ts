import _ from 'lodash';
import { KubeObject } from '../types';
import { deepKeys, deepClearEmpties } from './deep';

export const lastConfigAnnotation = process.env.LAST_CONFIG_ANNOTATION
  || "knop.skimia.org/last-applied-configuration";

export const kubectlLastConfigAnnotation = "kubectl.kubernetes.io/last-applied-configuration";

export interface DiffResult {
  changed: any;
  removed: any;
  paths: string[];
  isChanged: boolean;
}

export const flatDiff = (object: any, base: any): any => {
  function changes(object: any, base: any): void {
    return _.transform(object, function (result: any, value: any, key: any) {
      if (!_.isEqual(value, base[key])) {
        result[key] = (_.isObject(value) && _.isObject(base[key])) ? changes(value, base[key]) : value;
      }
    });
  }

  return changes(object, base);
}

export const fullDiff = (object: any, base: any): DiffResult => {
  const changed = flatDiff(object, base);
  const removed = flatDiff(base, object);

  const changedKeys = deepKeys(changed);
  const removedKeys = deepKeys(removed);
  return {
    changed: deepClearEmpties(changed),
    removed: deepClearEmpties(_.omit(removed, changedKeys)),
    paths: _.uniq([...changedKeys, ...removedKeys]),
    isChanged: Object.keys(changed).length > 0 || Object.keys(removed).length > 0
  }
}

export const inferLastConfig = (object: KubeObject): Partial<KubeObject> => {
  const { status, ...restObj } = object || { metadata: {}};

  const { annotations, name, namespace, labels } = restObj.metadata || {};

  const newAnnotations = _.omit(
    annotations, [
    "kubectl.kubernetes.io/last-applied-configuration",
    lastConfigAnnotation
  ]
  );
  const obj = {
    ...restObj,
    metadata: _.omitBy({
      annotations: Object.keys(newAnnotations).length === 0 ? undefined : newAnnotations,
      name,
      namespace,
      labels
    }, _.isUndefined),
  };

  return obj;
}

export const kubeDifferences = (object: KubeObject): DiffResult => {
  const annotation = object?.metadata?.annotations?.[lastConfigAnnotation];
  if (!annotation) {
    return fullDiff(inferLastConfig(object), {});
  }

  const obj = JSON.parse(annotation);

  const lastConf = inferLastConfig(object);

  return fullDiff(lastConf, obj);
}

export const isLastConfig = (object: KubeObject): boolean => {
  const diffs = kubeDifferences(object);

  return !diffs.isChanged;
}


