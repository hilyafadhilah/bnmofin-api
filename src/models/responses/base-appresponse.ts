export interface BaseAppResponseMetadata {
  items: number,
  timestamp: string,
}

export abstract class BaseAppResponse <T, M extends BaseAppResponseMetadata> {
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
