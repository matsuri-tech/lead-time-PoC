# ---------- build stage ----------
    FROM node:20 AS builder
    WORKDIR /app
    
    COPY package*.json ./
    RUN npm install
    
    COPY . .
    RUN npm run build          
    
 # ---------- runtime stage ----------
    FROM node:20-slim AS runtime
    WORKDIR /app
    
    ENV NODE_ENV=production      
    EXPOSE 8080                  
    
    COPY package*.json ./
    RUN npm install --omit=dev
    
    COPY --from=builder /app/dist ./dist
    CMD ["node", "dist/index.js"]
    