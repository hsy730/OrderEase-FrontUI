# Docker部署说明

## 构建和运行Docker镜像

### 使用Docker命令

1. 构建Docker镜像:
```bash
docker build -t order-ease-frontend .
```

2. 运行容器:
```bash
docker run -d -p 3001:80 --name order-ease-app order-ease-frontend
```

### 使用Docker Compose

1. 构建并启动服务:
```bash
docker-compose up -d
```

2. 查看服务状态:
```bash
docker-compose ps
```

3. 停止服务:
```bash
docker-compose down
```

## 端口说明

本项目涉及多个端口，它们有不同的用途：

1. **开发服务器端口 (3001)**:
   - 在`vite.config.js`中配置
   - 用于开发环境的Vite开发服务器
   - 提供热重载和实时预览功能
   - 启动开发服务器命令: `npm run dev`

2. **Docker容器端口 (80)**:
   - 在Dockerfile中通过`EXPOSE 80`暴露
   - Nginx服务器在容器内监听的端口
   - 提供生产环境的静态文件服务

3. **主机映射端口 (8080)**:
   - 在docker-compose.yml中配置为`8080:80`
   - 将主机的8080端口映射到容器的80端口
   - 访问地址: http://localhost:8080

如果您希望使用不同的主机端口，可以修改docker-compose.yml中的端口映射:
```yaml
ports:
  - "3001:80"  # 将主机的3001端口映射到容器的80端口
```

或者在运行docker命令时指定:
```bash
docker run -d -p 3001:80 --name order-ease-app order-ease-frontend
```

## 环境变量配置

可以通过环境变量来配置应用:

- `NODE_ENV`: 设置为`production`以启用生产环境优化
- `API_BASE_URL`: 设置后端API的基础URL

在docker-compose.yml中配置:
```yaml
environment:
  - NODE_ENV=production
  - API_BASE_URL=https://your-api-domain.com
```

## 访问应用

启动容器后，通过以下URL访问应用：
- **URL**: http://localhost:3001/order-ease-iui/

这个URL的构成如下：
- `http://localhost:3001`：这是docker-compose.yml中配置的主机端口映射，将您本地机器的3001端口映射到容器的80端口
- `/order-ease-iui/`：这是vite.config.js中配置的base路径

## 注意事项

1. 确保端口8080没有被其他应用占用
2. 如果需要修改端口映射，可以在docker-compose.yml或docker run命令中调整
3. 构建过程可能需要几分钟时间，取决于网络速度和机器性能