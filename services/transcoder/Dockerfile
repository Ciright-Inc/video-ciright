FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev 2>/dev/null || npm install --omit=dev

COPY tsconfig.json ./
COPY src ./src
RUN npm install typescript tsx --no-save && npm run build && npm prune --omit=dev

ENV PORT=4000
EXPOSE 4000

CMD ["node", "dist/index.js"]
