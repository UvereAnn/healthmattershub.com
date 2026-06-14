# ─────────────────────────────────────────────
#  Stage 1: Dependencies
#  Install only production dependencies
# ─────────────────────────────────────────────
FROM node:18-alpine AS dependencies

# Set working directory inside container
WORKDIR /app

# Copy package files first
# (Docker caches this layer - only re-runs if package.json changes)
COPY package*.json ./

# Install production dependencies only
# ci = clean install, faster and more reliable than npm install
RUN npm ci --only=production

# ─────────────────────────────────────────────
#  Stage 2: Production Image
#  Copy app code and run
# ─────────────────────────────────────────────
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
# This ensures graceful shutdown when Docker stops the container
RUN apk add --no-cache dumb-init

# Create a non-root user for security
# Running as root inside containers is a security risk
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Copy dependencies from stage 1
COPY --from=dependencies /app/node_modules ./node_modules

# Copy application code
COPY --chown=nodeuser:nodejs . .

# Create uploads directory with correct ownership
RUN mkdir -p uploads && chown nodeuser:nodejs uploads

# Switch to non-root user
USER nodeuser

# Tell Docker this container listens on port 5000
EXPOSE 5000

# Health check
# Docker runs this every 30 seconds
# If it fails 3 times container is marked unhealthy
HEALTHCHECK --interval=30s \
            --timeout=10s \
            --start-period=40s \
            --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

# Start the application
# dumb-init runs as PID 1 and handles signals properly
CMD ["dumb-init", "node", "server.js"]