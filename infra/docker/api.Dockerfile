FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages ./packages
COPY data/fixtures ./data/fixtures
COPY apps/api ./apps/api
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @missa-sync/api exec prisma generate --schema prisma/schema.prisma
RUN pnpm --filter @missa-sync/api... build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
COPY --from=build /app/data/fixtures ./data/fixtures
COPY --from=build /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/apps/api/prisma ./apps/api/prisma
COPY --from=build /app/apps/api/dist ./apps/api/dist
WORKDIR /app/apps/api
RUN node /app/node_modules/.pnpm/prisma@6.19.3_typescript@5.9.3/node_modules/prisma/build/index.js generate --schema /app/apps/api/prisma/schema.prisma
EXPOSE 3001
CMD ["node", "dist/server.js"]
