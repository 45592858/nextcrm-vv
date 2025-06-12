1）服务器上 git 同步最新的代码：git pull
2）停止服务：docker compose down
3）重新构建：docker compose build
4）启动服务：docker compose up -d


注：
1）首次安装，请设置好 .env & .env.local
2）首次构建基础镜像：docker build -f Dockerfile.base -t nextcrm-base:20 .
3）如要运行 Jobs，参考命令：docker exec -it nextcrm-vv node jobs/mail_queue_worker.js

4）命令参考：
  docker compose build && docker compose up -d && docker compose logs -f nextcrm-vv
  docker compose build --no-cache && docker compose up -d && docker compose logs -f nextcrm-vv


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


快速查找大文件（及目录，前20个）
du -ah / | sort -rh | head -n 20

删除所有未被使用的镜像，包括悬空镜像
docker image prune -a

删除所有停止的容器、所有未使用的镜像以及所有未使用的网络、所有构建缓存
docker system prune -a
