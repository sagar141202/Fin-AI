# Use official Node image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files first (Docker caches this layer)
COPY package*.json .

# Install dependencies
RUN npm install

# Copy all frontend files
COPY . .

# Expose port 5173
EXPOSE 5173

# Start Vite dev server
CMD ["npm", "run", "dev", "--", "--host"]
