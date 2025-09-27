# 使用官方Node.js运行时作为基础镜像
FROM node:18-alpine AS build

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json（如果存在）
COPY package*.json ./

# 安装所有依赖（包括开发依赖）
RUN npm ci && npm cache clean --force

# 复制项目源代码
COPY . .

# 构建生产版本
RUN npm run build

# 使用nginx作为生产服务器
FROM nginx:alpine

# 复制构建产物到nginx服务器
COPY --from=build /app/dist /usr/share/nginx/html/order-ease-iui

# 复制nginx配置文件
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 80

# 启动nginx服务器
CMD ["nginx", "-g", "daemon off;"]