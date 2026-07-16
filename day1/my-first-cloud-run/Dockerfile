FROM nginx:alpine

# Copy static assets to the default Nginx public directory
COPY . /usr/share/nginx/html

# Replace port 80 with 8080 in the default Nginx configuration
RUN sed -i 's/listen\(.*\)80;/listen 8080;/g' /etc/nginx/conf.d/default.conf

# Expose port 8080
EXPOSE 8080
