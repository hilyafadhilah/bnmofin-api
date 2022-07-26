import { BaseAppResponseMetadata, BaseAppResponse } from './base-appresponse';

export class SingularAppResponse <T> extends BaseAppResponse<T, BaseAppResponseMetadata> {
  get meta() {
    return {
      items: 1,
      timestamp: this.timestamp,
    };
  }
}
