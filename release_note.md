1）服务器上 git 同步最新的代码：git pull
2）停止服务：docker compose down
3）重新构建：docker compose build
4）启动服务：docker compose up -d


注：
1）首次安装，请设置好 .env & .env.local
2）首次构建基础镜像：docker build -f Dockerfile.base -t nextcrm-base:20 .
3）每次发布重新构建应用镜像： docker build -t nextcrm-vv:latest . （ == docker compose build）

Git代理配置：
  临时代理设置：
    git config http.proxy http://8.210.117.141:8888
    git config https.proxy http://8.210.117.141:8888
 
  永久代理设置：
    git config --global http.proxy http://8.210.117.141:8888
    git config --global https.proxy http://8.210.117.141:8888

  取消设置的代理：
    git config --global --unset http.proxy
    git config --global --unset https.proxy


访问以下网址获取 免费 代理 IP
https://free-proxy-list.net/

验证代理是否能访问 github
curl -x http://8.210.117.141:8888 https://github.com
