# NHX Wallet Deployment Guide

## 1. Build and start containers

```bash
sudo docker compose -f docker-compose.prod.yml up -d --build
```

## 2. View Logs

```bash
sudo docker compose -f docker-compose.prod.yml logs --tail=10 backend
```

## 3. Pull & Restart

```bash
git pull
sudo docker compose -f docker-compose.prod.yml down
sudo docker compose -f docker-compose.prod.yml up -d --build
```

## 3. Stop Containers

```bash
sudo docker compose -f docker-compose.prod.yml down
```

## 4. Postgres

```bash
sudo docker exec -it nhx-wallet-prod-db psql -U postgres -d postgres
```
