# ─────────────────────────────────────────────
#  Stage 1: Builder
#  Node.js installs dependencies and builds React
#  This stage is DISCARDED after build
#  Nothing from here goes into the final image
#  except the build/ folder
# ─────────────────────────────────────────────
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first
# Docker caches this layer
# Only re-runs npm install if package.json changes
COPY package*.json ./

# Install ALL dependencies (including devDependencies)
# We need devDependencies to build React
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build arguments for environment variables
# These get baked into the React build at build time
ARG REACT_APP_API_URL
ARG REACT_APP_SITE_NAME
ARG REACT_APP_SITE_TAGLINE

# Set as environment variables for the build
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_SITE_NAME=$REACT_APP_SITE_NAME
ENV REACT_APP_SITE_TAGLINE=$REACT_APP_SITE_TAGLINE

# Build the React app
# Creates the build/ folder with optimized static files
RUN npm run build

# ─────────────────────────────────────────────
#  Stage 2: Production Runner
#  Nginx serves the static files
#  Final image is ~25MB (no Node.js!)
# ─────────────────────────────────────────────
FROM nginx:alpine AS production

# Copy our custom Nginx config
# Replaces the default Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the React build from Stage 1
# This is the ONLY thing we take from the builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Tell Docker this container listens on port 80
EXPOSE 80

# Health check
# Nginx serves a simple 200 on / when healthy

# 1. Add curl right here
RUN apk add --no-cache curl

HEALTHCHECK --interval=30s \
            --timeout=10s \
            --start-period=20s \
            --retries=3 \
  CMD curl -f http://localhost:80 || exit 1

# Start Nginx in foreground
# daemon off = keeps Nginx running as main process
# This is required for Docker to manage the process
CMD ["nginx", "-g", "daemon off;"]