import { OperatorBroker } from '../broker';

/* eslint-disable @typescript-eslint/no-misused-new */
export interface Controller {
  name: string;
  init(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
}

export interface ControllerConstructor {
  new(broker: OperatorBroker): Controller;
}

export declare let Controller: ControllerConstructor;
