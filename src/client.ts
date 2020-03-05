import { ApiRoot, Apis } from 'kubernetes-client';
import { Logger } from 'pino';
import { finished } from "stream";
import { ReadStream } from 'fs';
import humanizeDuration from 'humanize-duration';
import { KubeObject, KubeStatus } from './types';
import { isLastConfig, inferLastConfig, lastConfigAnnotation } from './utils';

export interface ResourceType {
  apiGroup: string;
  apiVersion: string;
  pluralKind: string;
  namespace?: string;
}

interface ResourceEvent {
  meta: ResourceMeta;
  type: ResourceEventType;
  object: KubeObject;
}

interface ResourceMeta {
  name: string;
  namespace: string;
  id: string;
  resourceVersion: string;
  apiVersion: string;
  kind: string;
}

export enum ResourceEventType {
  Added = 'ADDED',
  Modified = 'MODIFIED',
  Deleted = 'DELETED'
}


export class KubeClient implements ApiRoot {

  public constructor(private logger: Logger, private client: ApiRoot) { }

  addCustomResourceDefinition(schema: object): void {
    return this.client.addCustomResourceDefinition(schema);
  }

  get api(): import("kubernetes-client").Api {
    return this.client.api
  }

  get apis(): Apis {
    return this.client.apis
  }

  get log(): import("kubernetes-client").Logs {
    return this.client.log
  }

  get logs(): import("kubernetes-client").Logs {
    return this.client.logs
  }

  get version(): import("kubernetes-client").Version {
    return this.client.version
  }

  public async getStream(res: ResourceType): Promise<ReadStream> {
    if (res.namespace && res.namespace.length) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      return this.client.apis[res.apiGroup][res.apiVersion]
        .watch.namespace(res.namespace)[res.pluralKind].getObjectStream()
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      return this.client.apis[res.apiGroup][res.apiVersion]
        .watch[res.pluralKind].getObjectStream()
    }
  }

  public async watchResource(res: ResourceType, onEvent: (event: ResourceEvent) => Promise<void>): Promise<() => void> {
    const startDate = Date.now();
    let started = true;
    let stop: () => void;
    const suffix = `${res.pluralKind}[${res.apiGroup}/${res.apiVersion}] on ns ${res.namespace || '*'}`
    this.logger.debug(`Start Streaming ${suffix}`);

    const readStream = await this.getStream(res);

    finished(readStream, async (err) => {
      if (started) {
        const range = Date.now() - startDate;
        if (err) {
          this.logger.warn(`Stream ${suffix} is failing, restarting ${humanizeDuration(range)}`, err);
        } else {
          this.logger.debug(`Stream ${suffix} is done, restarting ${humanizeDuration(range)}`);
        }
        stop = await this.watchResource(res, onEvent);
      }
    });

    readStream.on("data", (obj: ResourceEvent) => onEvent(obj));

    return (): void => {
      this.logger.debug(`Stop Streaming ${suffix}`);
      started = false;
      readStream.close();

      if (stop) {
        stop();
      }
    }
  }

  public async watchUniqueResource(res: ResourceType, onEvent: (event: ResourceEvent) => Promise<KubeStatus | boolean>): Promise<() => void> {
    const suffix = `${res.pluralKind}[${res.apiGroup}/${res.apiVersion}] on ns ${res.namespace || '*'}`

    return this.watchResource(res, async (event: ResourceEvent): Promise<void> => {
      const { object, type } = event;

      if (type === ResourceEventType.Added || type === ResourceEventType.Modified) {
        // creation or update => check last operator execution
        if (isLastConfig(object)) {
          this.logger.debug(`Resource ${suffix} already handled!`);

          return;
        }

        // Run Handler
        const status: KubeStatus = (await onEvent(event) as KubeStatus);

        // Patch last config
        const newObj = await this.updateLastConfig(res, object);

        // Patch status
        await this.updateStatus(res, {
          ...newObj, status: {
            ...newObj.status,
            ...status,
          }
        });
      } else if (type === ResourceEventType.Deleted) {
        await onEvent(event);
      }
    })
  }

  public async updateStatus(res: ResourceType, object: KubeObject): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    return this.client.apis[res.apiGroup][res.apiVersion]
      .namespaces(object.metadata.namespace)
    [res.pluralKind](object.metadata.name).status.put({
      body: object,
    });
  }

  public async updateLastConfig(res: ResourceType, object: KubeObject): Promise<KubeObject> {
    const anno = inferLastConfig(object);
    object.metadata = {
      ...object.metadata,
      annotations: {
        ...object.metadata.annotations,
        [lastConfigAnnotation]: JSON.stringify(anno),
      }
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const { body } = await  this.client.apis[res.apiGroup][res.apiVersion]
      .namespaces(object.metadata.namespace)
    [res.pluralKind](object.metadata.name).put({
      body: object,
    });

    return body;
  }
}
