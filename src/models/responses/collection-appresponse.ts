import { BaseAppResponseMetadata, BaseAppResponse } from './base-appresponse';

export interface CollectionInfo {
  totalItems: number
  page: number
  pageSize: number
  totalPages: number
}

type CollectionMetadata = BaseAppResponseMetadata & CollectionInfo;

export class CollectionAppResponse <T> extends BaseAppResponse <T[], CollectionMetadata> {
  constructor(data: T[], public readonly info: Omit<CollectionInfo, 'totalPages'>) {
    super(data);
  }

  get meta() {
    const { page, pageSize, totalItems } = this.info;
    return {
      timestamp: this.timestamp,
      items: this.data.length,
      totalItems,
      page,
      pageSize,
      totalPages: Math.ceil(totalItems / pageSize),
    };
  }
}
