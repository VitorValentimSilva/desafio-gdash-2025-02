# ---- Build ----
FROM node:18 AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

# ---- Run (nginx) ----
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# Permitir APIs externas com CORS
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
