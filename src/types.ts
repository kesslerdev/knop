/* eslint-disable @typescript-eslint/no-explicit-any */
import { KubernetesObject } from '@kubernetes/client-node';

export interface KubeObject extends KubernetesObject {
  spec: KubeSpec;
  status: KubeStatus;
}

export interface KubeSpec {
  [s: string]: any;
}
export interface KubeStatus {
  [s: string]: any;
}
