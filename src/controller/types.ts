export interface Controller {
  name: string;
  init(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
}
