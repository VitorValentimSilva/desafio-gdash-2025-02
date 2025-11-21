# build stage
FROM golang:1.20-alpine AS build
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /worker .

# final
FROM alpine:3.18
RUN apk add --no-cache ca-certificates
COPY --from=build /worker /worker
USER 65532:65532
ENTRYPOINT ["/worker"]
