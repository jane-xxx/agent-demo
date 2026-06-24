#!/bin/bash

# ============================================
# Vue 3 项目自动部署脚本
# ============================================
# 使用说明：
# 1. 修改下方配置变量为你的实际值
# 2. chmod +x deploy.sh
# 3. ./deploy.sh

# ================== 配置区域 ==================

# 服务器连接信息
SERVER_USER="root"        # SSH 用户名
SERVER_HOST="123.57.84.47"        # 服务器 IP 或域名
SERVER_PATH="/web/agent-demo"  # 服务器上的部署路径

# SSH 密码（如果使用密码认证而非密钥）
# 留空则使用密钥认证，填写密码则使用密码登录
SSH_PASSWORD=""

# ================== 部署脚本 ==================

set -e  # 遇到错误立即退出

# 颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 函数：打印带颜色的消息
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    log_error "请在项目根目录下运行此脚本"
    exit 1
fi

# 步骤 1: 安装依赖
log_info "步骤 1/5: 安装项目依赖..."
npm install

# 步骤 2: 构建项目
log_info "步骤 2/5: 构建生产版本..."
npm run build

if [ ! -d "dist" ]; then
    log_error "构建失败：dist 目录不存在"
    exit 1
fi

log_success "构建完成"

# 步骤 3: 测试服务器连接
log_info "步骤 3/5: 测试服务器连接..."

# 检查 sshpass 是否安装（用于密码认证）
if [ -n "$SSH_PASSWORD" ]; then
    if ! command -v sshpass > /dev/null 2>&1; then
        log_error "使用密码登录需要安装 sshpass"
        echo "  macOS: brew install sshpass"
        echo "  Ubuntu/Debian: sudo apt install sshpass"
        exit 1
    fi
    SSH_BASE="sshpass -p ${SSH_PASSWORD} ssh"
    RSYNC_BASE="sshpass -p ${SSH_PASSWORD} rsync"
    SCP_BASE="sshpass -p ${SSH_PASSWORD} scp"
else
    SSH_BASE="ssh"
    RSYNC_BASE="rsync"
    SCP_BASE="scp"
fi

# 构建SSH命令
SSH_CMD="$SSH_BASE ${SERVER_USER}@${SERVER_HOST}"

# 测试连接
if ! $SSH_CMD -o StrictHostKeyChecking=no "echo 'Connection successful'" > /dev/null 2>&1; then
    log_error "无法连接到服务器。请检查："
    echo "  1. 服务器 IP 是否正确"
    echo "  2. SSH 密钥或密码是否配置"
    echo "  3. 是否可以手动连接：ssh ${SERVER_USER}@${SERVER_HOST}"
    exit 1
fi

log_success "服务器连接正常"

# 步骤 4: 创建服务器目录（如果不存在）
log_info "步骤 4/5: 确保服务器目录存在..."

$SSH_CMD "sudo mkdir -p ${SERVER_PATH} && sudo chown -R ${SERVER_USER}:${SERVER_USER} ${SERVER_PATH}"

log_success "服务器目录准备完成"

# 步骤 5: 上传文件
log_info "步骤 5/5: 上传文件到服务器..."

# 使用 rsync 上传（更高效，支持增量）
if command -v rsync > /dev/null 2>&1; then
    log_info "使用 rsync 上传..."
    $RSYNC_BASE -avz --delete -e "ssh -o StrictHostKeyChecking=no" dist/ ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/
else
    log_warning "rsync 未安装，使用 scp 上传..."
    $SCP_BASE -o StrictHostKeyChecking=no -r dist/* ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/
fi

log_success "文件上传完成"

# 验证部署
log_info "验证部署..."
$SSH_CMD "ls -la ${SERVER_PATH}/index.html" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    log_success "部署成功！"
    echo ""
    echo "=================================="
    log_success "你的应用已部署到服务器"
    echo "=================================="
    echo ""
    echo "访问地址: http://${SERVER_HOST}"
    echo "服务器路径: ${SERVER_PATH}"
    echo ""
    log_info "下一步："
    echo "  1. 配置 DNS 解析"
    echo "  2. 设置 SSL 证书: sudo certbot --nginx -d your-domain.com"
    echo "  3. 如有问题，查看: docs/deploy-to-vps.md"
    echo ""
else
    log_error "部署验证失败，请检查服务器上的文件"
    exit 1
fi
