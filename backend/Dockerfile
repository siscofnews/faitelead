FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm ci || yarn || pnpm i
COPY . .
ENV PORT=8090
EXPOSE 8090
CMD ["node", "src/server.js"]
