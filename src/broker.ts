import { Logger } from 'pino';
import { KubernetesObject } from "@kubernetes/client-node";
import { sync } from 'glob';
import { readFileSync } from 'fs';
import { parse } from 'yaml';
import { createLogger, createClient } from './utils';
import { Controller, ControllerConstructor } from './controller';
import { KubeClient } from './client';

export class OperatorBroker {
  protected baseLogger: Logger;
  protected logger: Logger;
  protected client: KubeClient;
  protected initialized = false;
  protected started = false;

  protected controllersClasses: ControllerConstructor[] = [];
  protected controllers: Controller[] = [];
  protected crdManifests: KubernetesObject[] = [];

  public constructor(private name: string) {
    this.baseLogger = createLogger(this.name);
    this.logger = this.baseLogger.child({ caller: 'broker' });
  }

  public async init(): Promise<void> {
    if (this.initialized) {
      const err = new Error('Broker already initialized');
      this.logger.error(err);
      throw err;
    }

    this.logger.info('Initializing broker');
    this.client = await createClient(this.logger, this.crdManifests);

    this.logger.info('Initializing controllers');

    for (const ctrl of this.controllersClasses) {
      const instance = new ctrl(this);
      this.controllers.push(instance);
      await instance.init();
    }

    this.logger.info('Controllers initialized');
    this.logger.info('Broker initialized');
  }

  public async start(): Promise<void> {
    if (this.started) {
      const err = new Error('Broker already started');
      this.logger.error(err);
      throw err;
    }

    if (!this.initialized) {
      await this.init();
    }
    this.logger.info('Starting broker');
    this.logger.info('Starting controllers');

    for (const ctrl of this.controllers) {
      await ctrl.start();
    }

    this.logger.info('Controllers started');
    this.logger.info('Broker started');
  }

  public async stop(passWithoutError = false): Promise<void> {
    if (!this.started && !passWithoutError) {
      const err = new Error('Broker not started');
      this.logger.error(err);
      throw err;
    } else if (!this.started && passWithoutError) {
      return;
    }

    this.logger.info('Stopping broker');
    this.logger.info('Stopping controllers');

    for (const ctrl of this.controllers) {
      await ctrl.stop();
    }

    this.logger.info('Controllers stopped');
    this.logger.info('Broker stopped');
  }

  public loadCRDs(glob: string): number {
    this.logger.info(`Loading CRDs with glob ${glob}`);

    const paths = sync(glob);

    for (const path of paths) {
      this.loadCRD(path);
    }
    return paths.length;
  }

  public loadCRD(path: string): void {
    this.logger.info(`Loading CRD from ${path}`);

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { CRDPath } = require(path);

    if (!CRDPath) {
      const err = new Error(`Unable to load CRD from ${path}`);
      this.logger.error(err);
      throw err;
    }

    const CRD = parse(readFileSync(CRDPath, 'utf8'));

    this.crdManifests.push(CRD);

    this.logger.info(`Successfully loaded CRD(${CRD.metadata.name}) from ${path}`);
  }

  public loadControllers(glob: string): number {
    this.logger.info(`Loading controllers with glob ${glob}`);

    const paths = sync(glob);

    for (const path of paths) {
      this.loadController(path);
    }
    return paths.length;
  }

  public loadController(path: string): ControllerConstructor {
    this.logger.info(`Loading controller from ${path}`);

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ctrl: ControllerConstructor = require(path).default;
    if (!ctrl) {
      const err = new Error(`Unable to load controller from ${path}`);
      this.logger.error(err);
      throw err;
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    this.logger.info(`Successfully loaded controller(${ctrl.name}) from ${path}`);

    this.controllersClasses.push(ctrl);

    return ctrl;
  }

  public getLogger(): Logger {
    return this.logger;
  }

  public getClient(): KubeClient {
    return this.client;
  }
}
