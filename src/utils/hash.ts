import { createHmac } from "crypto";
import { KubeObject } from '../types';

export const kubeHash = (object: KubeObject): string => {
  const { metadata, spec } = object;

  return createHmac('sha256', process.env.HASHER_KEY || 'knop')
    .update(JSON.stringify({ metadata: { ...metadata, resourceVersion: false }, spec }))
    .digest('hex');
}

export const HashKey = process.env.STATUS_HASH_KEY || "knopHashKey";
