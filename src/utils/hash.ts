import { createHmac } from "crypto";

export const kubeHash = (object: any) => {
  const { metadata, spec } = object;

  return createHmac('sha256', process.env.HASHER_KEY || 'knop')
    .update(JSON.stringify({ metadata: { ...metadata, resourceVersion: false }, spec }))
    .digest('hex');
}
