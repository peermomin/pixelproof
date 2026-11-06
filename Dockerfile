FROM node:24-alpine AS dependencies
WORKDIR /app
COPY package.json ./
RUN npm install --include=dev --no-audit --no-fund

FROM node:24-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=builder /app .
RUN addgroup -S pixelproof && adduser -S pixelproof -G pixelproof && chown -R pixelproof:pixelproof /app
USER pixelproof
EXPOSE 3000
CMD ["sh", "-c", "npm run db:migrate && npm run start"]
