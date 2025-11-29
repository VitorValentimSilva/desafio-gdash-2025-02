FROM node:18-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production || npm install

COPY . .
RUN npm run build

RUN if [ -d "./src/locales" ]; then mkdir -p ./dist/locales && cp -r ./src/locales/* ./dist/locales/; fi

FROM node:18-alpine
WORKDIR /app

COPY --from=build /app/dist ./dist
COPY package.json ./
RUN npm ci --only=production || npm install --omit=dev

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/main.js"]
