FROM oven/bun:1.2-slim AS base
WORKDIR /app

COPY package.json ./
RUN bun install

COPY . .

RUN bun run build

CMD ["bun", "run", "start"]