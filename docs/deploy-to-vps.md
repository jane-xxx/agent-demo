# VPS 部署指南

本指南介绍如何将 Vue 3 项目部署到传统 VPS 服务器（如 DigitalOcean、AWS EC2、阿里云等）。

## 前提条件

- 已有 VPS 服务器，运行 Ubuntu/Debian Linux
- 已有域名并指向服务器 IP
- 服务器可以通过 SSH 访问
- 有 sudo 权限

## 部署架构

```
用户 → 域名 → Nginx (HTTPS) → 静态文件 (dist/)
```

## 部署步骤

### 第一步：在服务器上安装 Nginx

```bash
# SSH 登录到服务器
ssh user@your-server-ip

# 更新包管理器
sudo apt update

# 安装 Nginx
sudo apt install nginx -y

# 启动 Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 第二步：配置 Nginx

将项目根目录下的 `nginx.conf` 复制到服务器：

```bash
# 在本地执行
scp docs/nginx.conf user@your-server-ip:/tmp/
```

然后在服务器上：

```bash
# 移动配置文件
sudo mv /tmp/nginx.conf /etc/nginx/sites-available/multiagent-app

# 创建符号链接
sudo ln -s /etc/nginx/sites-available/multiagent-app /etc/nginx/sites-enabled/

# 删除默认配置（可选）
sudo rm /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

**重要**: 编辑配置文件中的域名：
```bash
sudo nano /etc/nginx/sites-available/multiagent-app
```
将 `your-domain.com` 替换为你的实际域名。

### 第三步：构建项目

在本地构建项目：

```bash
npm install
npm run build
```

构建完成后，`dist` 目录包含所有静态文件。

### 第四步：上传静态文件

```bash
# 创建网站目录
ssh user@your-server-ip "sudo mkdir -p /var/www/multiagent-app && sudo chown -R $USER:$USER /var/www/multiagent-app"

# 上传文件
scp -r dist/* user@your-server-ip:/var/www/multiagent-app/
```

### 第五步：设置 SSL 证书 (HTTPS)

使用 Let's Encrypt 免费证书：

```bash
# 在服务器上安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书（会自动配置 Nginx）
sudo certbot --nginx -d your-domain.com

# 测试自动续期
sudo certbot renew --dry-run
```

### 第六步：配置自动续期

Certbot 会自动配置续期，但你可以验证：

```bash
sudo systemctl status certbot.timer
```

### 第七步：验证部署

1. 访问 `https://your-domain.com`
2. 检查所有路由是否正常工作
3. 验证 HTTPS 证书有效

## 更新部署

当项目更新后，只需：

```bash
# 本地构建
npm run build

# 上传新文件
scp -r dist/* user@your-server-ip:/var/www/multiagent-app/

# Nginx 会自动服务新文件，无需重启
```

## 高级：自动化部署脚本

如果你需要自动化部署，可以使用项目根目录下的 `deploy.sh` 脚本：

```bash
# 编辑脚本，填入你的服务器信息
nano deploy.sh

# 添加执行权限
chmod +x deploy.sh

# 执行部署
./deploy.sh
```

## 故障排查

### 网站无法访问

```bash
# 检查 Nginx 状态
sudo systemctl status nginx

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log
```

### 404 错误

确保 Vue Router 使用 history 模式时，Nginx 配置了 `try_files` 指令（已在 nginx.conf 中配置）。

### HTTPS 证书问题

```bash
# 检查证书状态
sudo certbot certificates

# 手动续期
sudo certbot renew
```

### 文件权限问题

```bash
# 确保 Nginx 可以读取文件
sudo chmod -R 755 /var/www/multiagent-app
sudo chown -R www-data:www-data /var/www/multiagent-app
```

## 安全建议

1. **防火墙配置**
   ```bash
   sudo ufw allow 22    # SSH
   sudo ufw allow 80    # HTTP
   sudo ufw allow 443   # HTTPS
   sudo ufw enable
   ```

2. **定期更新**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

3. **禁用 root 登录**
   ```bash
   sudo nano /etc/ssh/sshd_config
   # 设置 PermitRootLogin no
   sudo systemctl restart sshd
   ```

## 性能优化（可选）

### 启用 Gzip 压缩

已在 nginx.conf 中配置 Gzip 压缩。

### 配置缓存

对于静态资源，可以配置浏览器缓存：

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### HTTP/2

Certbot 配置 HTTPS 时会自动启用 HTTP/2。

## 后续改进

当你准备好后，可以考虑：

1. **CI/CD 自动化**: 使用 GitHub Actions 或 GitLab CI
2. **容器化**: 使用 Docker 统一开发生产环境
3. **CDN**: 使用 Cloudflare 加速全球访问
4. **监控**: 配置 Uptime 监控

---

如有问题，请查看 Nginx 日志或参考 [Nginx 官方文档](https://nginx.org/en/docs/)。
