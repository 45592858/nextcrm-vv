# 依赖安装阶段
FROM nextcrm-base:20 AS deps

WORKDIR /app
COPY package*.json ./
COPY pnpm-lock.yaml ./
COPY .env .env.local ./
RUN pnpm install

# 构建阶段
FROM nextcrm-base:20 AS build_image
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/pnpm-lock.yaml ./
COPY . .
RUN pnpm prisma generate && \
    pnpm prisma db push && \
    pnpm prisma db seed && \
    pnpm run build

# 生产镜像
FROM nextcrm-base:20 AS production
ENV NODE_ENV production

RUN addgroup --system nodejs && \
    adduser --system --ingroup nodejs --home /app nextjs

WORKDIR /app
COPY --from=build_image --chown=nextjs:nodejs /app/package.json ./
COPY --from=build_image --chown=nextjs:nodejs /app/pnpm-lock.yaml ./
COPY --from=build_image --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=build_image --chown=nextjs:nodejs /app/public ./public
COPY --from=build_image --chown=nextjs:nodejs /app/dist/jobs ./jobs
COPY --from=build_image --chown=nextjs:nodejs /app/.next ./.next
COPY --from=build_image --chown=nextjs:nodejs /app/.env ./.env
COPY --from=build_image --chown=nextjs:nodejs /app/.env.local ./.env.local

USER nextjs
EXPOSE 3000
ENV HOME=/app
