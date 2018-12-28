# 基于 vue-cli 2 实现项目支持一键部署

 [查看博客](https://blog.csdn.net/xlz26296/article/details/83505678)

 1. 支持生成 zip 包
 2. 简化代理配置
 3. 支持本地测试访问生产包
 4. 基于 WinSCP 脚本支持一键部署

``` bash
# 切换为官网：
npm config set registry https://registry.npmjs.org

# 切换为淘宝镜像
npm config set registry https://registry.npm.taobao.org

# 安装依赖
npm install

# 启动本地服务
npm run dev 或者 npm run serve

# 编译生产包
npm run build

# 编译并生成 zip 生产包
npm run build:zip 或者 npm run build zip=dist

# 访问生产包
npm run start

# 编译并访问生产包
npm run build:start

# 编译打包分析器报告
npm run build --report

# 一键部署
npm run deploy 或者 npm run deploy u=root p=123456
```
