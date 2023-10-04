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

import {
  AssumeRoleCommand,
  AssumeRoleCommandOutput,
  STSClient,
  STSClientConfig,
} from '@aws-sdk/client-sts';
import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3';

export class S3ServiceClient extends S3Client {
  async assumeRole(): Promise<AssumeRoleCommandOutput> {
    const command = new AssumeRoleCommand({
      RoleArn: '',
      RoleSessionName: '',
      Policy: JSON.stringify({
        Version: '2012-10-17', // 协议版本，固定值
        Statement: [
          {
            Effect: 'Allow',
            Action: ['s3:GetObject', 's3:GetBucketLocation'],
            Resource: ['arn:aws:s3:::*'],
          },
        ],
      }),
      DurationSeconds: 3600, // 临时凭证有效期，单位秒，最小900，最大3600
    });

    const endpoint = await this.config.endpoint();
    const region = await this.config.region();
    const credentials = await this.config.credentials();

    const config: STSClientConfig = {
      endpoint,
      region,
      credentials,
    };

    return new STSClient(config).send(command);
  }
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class S3ServiceFactory extends ServiceFactory<S3ServiceClient> {
  @Config('s3')
  clientConfig: S3ClientConfig;

  @Logger('coreLogger')
  logger: ILogger;

  @Init()
  async init() {
    await this.initClients(this.clientConfig);
  }

  async createClient(config: S3ClientConfig): Promise<S3ServiceClient> {
    assert(
      !!config.credentials,
      '[@midwayjs/s3] credentials are required on config]'
    );
    this.logger.info('[midway:s3] init %s', JSON.stringify(config));
    return new S3ServiceClient(config);
  }

  getName(): string {
    return 's3';
  }
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class S3Service implements S3ServiceClient {
  @Inject()
  private serviceFactory: S3ServiceFactory;

  private instance: S3ServiceClient;

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
export interface S3Service extends S3ServiceClient {
  // empty
}

delegateTargetPrototypeMethod(S3Service, [S3ServiceClient]);
