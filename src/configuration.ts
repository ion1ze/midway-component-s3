import { Configuration, ILifeCycle, IMidwayContainer } from '@midwayjs/core';
import * as DEFAULT_CONFIG from './config.default';

@Configuration({
  namespace: 's3',
  importConfigs: [
    {
      default: DEFAULT_CONFIG,
    },
  ],
})
export class S3Configuration implements ILifeCycle {
  async onReady(container: IMidwayContainer): Promise<void> {
    await container.getAsync('s3Service');
  }
}
