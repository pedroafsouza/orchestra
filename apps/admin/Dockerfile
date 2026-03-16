FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/admin/package.json apps/admin/

RUN npm install --workspace=packages/shared --workspace=apps/admin

COPY packages/shared/ packages/shared/
COPY apps/admin/ apps/admin/

RUN npm -w packages/shared run build

ARG VITE_API_URL=http://localhost:3001
ENV VITE_API_URL=$VITE_API_URL
RUN npm -w apps/admin run build

FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/apps/admin/dist ./dist
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
