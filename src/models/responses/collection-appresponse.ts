import { BaseAppResponseMetadata, BaseAppResponse } from './base-appresponse';

export interface CollectionInfo {
  skip: number
  take: number
  total: number
}

type CollectionMetadata = BaseAppResponseMetadata & CollectionInfo;

export class CollectionAppResponse <T> extends BaseAppResponse <T[], CollectionMetadata> {
  constructor(data: T[], public readonly info: Omit<CollectionInfo, 'totalskips'>) {
    super(data);
  }

  get meta() {
    const { skip, take, total } = this.info;
    return {
      timestamp: this.timestamp,
      items: this.data.length,
      skip,
      take,
      total,
    };
  }
}
