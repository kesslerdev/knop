// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { Client, ApiRoot } from 'kubernetes-client';
import { Logger } from 'pino';
import { KubernetesObject } from '@kubernetes/client-node';

export const createClient = async (logger: Logger, crds: KubernetesObject[] = []): Promise<ApiRoot> => {
  const log = logger.child({
    caller: 'kube-client'
  });

  const client = new Client();
  log.info('Initialize Connection to K8S, and load spec');
  await client.loadSpec();
  log.info('Connection OK, spec loaded');

  for (const CRD of crds) {
    client.addCustomResourceDefinition(CRD);
    log.info(`Successfully loaded CRD(${CRD.metadata.name}) into client`);
  }

  return client;
}
