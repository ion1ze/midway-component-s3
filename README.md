# midway-component-s3

> 对接 `S3` 协议存储，使用的是 `AWS` 的 `SDK`，理论支持所有支持 `S3` 协议的对象存储，包括 `Minio`。

## 安装依赖

`npm i midway-component-s3 -S`

## 引入组件

首先，引入组件 `configuration.ts` 中导入：

```javascript
import { Configuration } from '@midwayjs/core';
import * as s3 from 'midway-component-s3';
import { join } from 'path'

@Configuration({
  imports: [
    // ...
    s3     // 导入 s3 组件
  ],
  importConfigs: [
    join(__dirname, 'config')
  ]
})
export class MainConfiguration {
}
```

## 配置 S3

`S3` 组件需要配置后才能使用，需要填写 `S3` 服务的 `endpoint`，`region`，`apiVersion`，`credentials` 等参数，下面是使用 `Minio` 自建服务的参数。

```javascript
// src/config/config.default
export default {
  // ...
  s3: {
    client: {
      endpoint: 'http://localhost:9000',
      region: 'local',
      apiVersion: '2011-06-15',
      credentials: {
        accessKeyId: 'your access key id',
        secretAccessKey: 'your secret access key',
      },
    },
  },
}
```

## 使用组件

使用 `STS` 获取临时秘钥

```javascript
import { S3Service } from 'midway-component-s3';
import { join } from 'path';

@Provide()
export class UserService {

  @Inject()
  s3Service: S3Service;

  async getCredentails() {

    const result = await s3Service.assumeRole({
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
    })
    // => result.Credentials
  }
}
```
