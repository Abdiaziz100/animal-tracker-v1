
# Production Deployment Checklist

## Pre-Deployment

### Security
- [ ] Change default admin credentials (`admin@farm.com / admin123`)
- [ ] Set strong `SECRET_KEY` in environment variables
- [ ] Configure CORS_ORIGINS for your domain
- [ ] Enable HTTPS/SSL
- [ ] Review rate limiting settings
- [ ] Set up firewall rules

### Database
- [ ] Switch from SQLite to PostgreSQL
- [ ] Set up database backups
- [ ] Configure database connection pooling
- [ ] Run migrations if needed

### Docker
- [ ] Build Docker image locally first
- [ ] Test with docker-compose locally
- [ ] Set up environment variables
- [ ] Configure volume mounts for persistence

### CI/CD
- [ ] Set up GitHub repository secrets:
  - `DEPLOY_HOST`
  - `DEPLOY_USER`
  - `DEPLOY_KEY`
- [ ] Test CI pipeline
- [ ] Configure monitoring

## Deployment Steps

### Option 1: Docker Compose (Recommended)
```bash
# 1. Clone repository
git clone <repo-url>
cd animal-tracker-app

# 2. Configure environment
cp .env.example .env
nano .env  # Set your values

# 3. Start services
docker-compose up -d

# 4. Check status
docker-compose ps
docker-compose logs -f
```

### Option 2: Manual Deployment
```bash
# Backend
cd backend
pip install -r requirements.txt
gunicorn --bind 0.0.0.0:5000 --workers 4 app:app

# Frontend
cd frontend
npm install
npm run build
# Serve with nginx
```

## Post-Deployment

### Verification
- [ ] Test login flow
- [ ] Test animal creation
- [ ] Test GPS update endpoint
- [ ] Test alert system
- [ ] Test map visualization
- [ ] Verify SSL certificate

### Monitoring
- [ ] Set up log monitoring
- [ ] Configure health check alerts
- [ ] Set up performance monitoring
- [ ] Test backup restore

## Rollback Plan

If deployment fails:
```bash
# Stop current containers
docker-compose down

# Rollback to previous version
git checkout <previous-tag>
docker-compose up -d
```

## Quick Commands

```bash
# View logs
docker-compose logs -f backend

# Restart service
docker-compose restart backend

# Update and deploy
git pull origin main
docker-compose up -d --build

# Backup database
docker-compose exec db pg_dump -U postgres animal_tracker > backup.sql

# Scale service
docker-compose up -d --scale backend=3
```

