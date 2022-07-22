import { BaseMetadata, BaseResponse } from './base-response';

export class SingularResponse <T> extends BaseResponse<T, BaseMetadata> {
  get meta() {
    return {
      items: 1,
      timestamp: this.timestamp,
    };
  }
}
