# Official Nginx on Alpine Linux
# Tiny image - only ~25MB
FROM nginx:alpine

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom config
COPY nginx.conf /etc/nginx/nginx.conf

# Health check for this container
HEALTHCHECK --interval=30s \
            --timeout=10s \
            --start-period=10s \
            --retries=3 \
  CMD wget -qO- http://localhost/nginx-health || exit 1

# Expose ports
EXPOSE 80
EXPOSE 443

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]