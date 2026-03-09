FROM node:20-bookworm-slim AS base

FROM base AS deps
WORKDIR /app

# Install system dependencies for Playwright
RUN apt-get update && apt-get install -y \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libcairo2 \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm install && npm install -g pm2

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Install Playwright Chromium
RUN npx playwright install chromium

# Build Next.js
RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install runtime dependencies for Playwright
RUN apt-get update && apt-get install -y \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libcairo2 \
    && rm -rf /var/lib/apt/lists/*

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Install PM2 globally
RUN npm install -g pm2

# Copy built Next.js app
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy source files needed for worker
COPY --from=builder --chown=nextjs:nodejs /app/src ./src
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Copy Playwright browser
COPY --from=builder /root/.cache/ms-playwright /home/nextjs/.cache/ms-playwright

# Copy PM2 ecosystem config
COPY --from=builder --chown=nextjs:nodejs /app/ecosystem.config.js ./ecosystem.config.js

# Fix permissions for Playwright cache
RUN chown -R nextjs:nodejs /home/nextjs/.cache

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV PLAYWRIGHT_BROWSERS_PATH=/home/nextjs/.cache/ms-playwright

CMD ["pm2-runtime", "start", "ecosystem.config.js"]
