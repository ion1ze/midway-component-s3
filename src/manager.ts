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
  AssumeRoleCommandInput,
  AssumeRoleCommandOutput,
  STSClient,
  STSClientConfig,
} from '@aws-sdk/client-sts';
import { S3Client, S3ClientConfig,S3ClientResolvedConfig } from '@aws-sdk/client-s3';

export class S3ServiceClient extends S3Client {
  /**
   * 获取临时凭证
   * @param params 参数
   * @returns 返回值
   */
  async assumeRole(params:AssumeRoleCommandInput): Promise<AssumeRoleCommandOutput> {
    const command = new AssumeRoleCommand(params);
    const config = await transform(this.config);
    return new STSClient(config).send(command);
  }
}

/**
 * 将 S3 Client 配置转换为 STS Client 配置
 * @param config S3 Client 配置
 * @returns STS Client 配置
 */
export async function transform(config:S3ClientResolvedConfig):Promise<STSClientConfig> {
  return {
    endpoint: await config.endpoint(),
    region: await config.region(),
    credentials: await config.credentials(),
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
