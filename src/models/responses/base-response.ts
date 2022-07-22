export interface BaseMetadata {
  items: number,
  timestamp: string,
}

export abstract class BaseResponse <T, M extends BaseMetadata> {
  public readonly timestamp;

  constructor(public readonly data: T) {
    this.timestamp = (new Date()).toISOString();
  }

  abstract get meta(): M;

  toObject() {
    return {
      meta: this.meta,
      data: this.data,
    };
  }
}
