import { ResourceEvent } from '../client';

export interface OperatorEnginePayload {
  event: ResourceEvent;
  diff: false|object;
}

export interface OperatorEngineResult {
  isSuccess: boolean;
  result?: any;
  error?: Error;
}

export interface OperatorEngine {
  onEvent(payload: OperatorEnginePayload): Promise<OperatorEngineResult>;
}
