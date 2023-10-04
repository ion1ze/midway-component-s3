import { S3ClientConfig } from '@aws-sdk/client-s3';

export * from './dist/index';

// 标准的扩展声明
declare module '@midwayjs/core/dist/interface' {
  // 将配置合并到 MidwayConfig 中
  interface MidwayConfig {
    s3?: ServiceFactoryConfigOption<S3ClientConfig>;
  }
}
