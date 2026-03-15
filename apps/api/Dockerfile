FROM node:20-alpine AS base
RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json package-lock.json* tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/database/package.json packages/database/
COPY apps/api/package.json apps/api/

RUN npm install --workspace=packages/shared --workspace=packages/database --workspace=apps/api

COPY packages/shared/ packages/shared/
COPY packages/database/ packages/database/
COPY apps/api/ apps/api/

RUN npm -w packages/shared run build
RUN npm -w packages/database run db:generate
RUN npm -w packages/database run build
RUN npm -w apps/api run build

EXPOSE 3001
CMD ["npm", "-w", "apps/api", "run", "start"]
