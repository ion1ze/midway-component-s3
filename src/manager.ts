import {
  Config,
  Init,
  Logger,
  Provide,
  ServiceFactory,
  ILogger,
  Scope,
  ScopeEnum,
  Inject,
  MidwayCommonError,
  delegateTargetPrototypeMethod,
} from '@midwayjs/core';
import * as assert from 'assert';

import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3';

@Provide()
@Scope(ScopeEnum.Singleton)
export class S3ServiceFactory extends ServiceFactory<S3Client> {
  @Config('s3')
  clientConfig: S3ClientConfig;

  @Logger('coreLogger')
  logger: ILogger;

  @Init()
  async init() {
    await this.initClients(this.clientConfig);
  }

  async createClient(config: S3ClientConfig): Promise<S3Client> {
    assert(
      !!config.credentials,
      '[@midwayjs/s3] credentials are required on config]'
    );
    this.logger.debug('[midway:s3] init %s', JSON.stringify(config));
    return new S3Client(config);
  }

  getName(): string {
    return 's3';
  }
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class S3Service implements S3Client {
  @Inject()
  private serviceFactory: S3ServiceFactory;

  private instance: S3Client;

  @Init()
  async init() {
    this.instance = this.serviceFactory.get(
      this.serviceFactory.getDefaultClientName?.() || 'default'
    );
    if (!this.instance) {
      throw new MidwayCommonError('s3 client default instance not found.');
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface S3Service extends S3Client {
  // empty
}

delegateTargetPrototypeMethod(S3Service, [S3Client]);
