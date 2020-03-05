import { KubernetesObject } from '@kubernetes/client-node';
import { CRDEngineController } from './crdEngine';
import { OperatorEngine } from '../engine';
import { BasicOperatorEngine } from '../engine/basic';

export abstract class CRDController extends CRDEngineController {

  protected abstract async handleCreation(obj: KubernetesObject): Promise<object>;
  protected abstract async handleModification(obj: KubernetesObject, diff: object|boolean): Promise<object>;
  protected abstract async handleDeletion(obj: KubernetesObject): Promise<boolean>;

  protected async initEngine(): Promise<OperatorEngine> {
    return new BasicOperatorEngine({
      debug: false,
      handleCreation: (...args): Promise<object> => this.handleCreation(...args),
      handleModification: (...args): Promise<object> => this.handleModification(...args),
      handleDeletion: (...args): Promise<boolean> => this.handleDeletion(...args),
    })
  }
}
