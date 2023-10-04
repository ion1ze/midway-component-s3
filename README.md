# midway-component-s3

> 对接 `S3` 协议存储，使用的是 `AWS` 的 `SDK`，理论支持所有支持 `S3` 协议的对象存储，包括 `Minio`。

## 开始使用

```javascript
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
```
