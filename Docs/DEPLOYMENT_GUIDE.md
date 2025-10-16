# Deployment Guide

This guide covers deploying the Student Transport Platform to production.

---

## 🔒 Security Checklist

Before deploying to production, ensure:

- [ ] Change all default passwords
- [ ] Generate strong `FLASK_SECRET_KEY`
- [ ] Use environment variables for sensitive data
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS for specific domains only
- [ ] Set up database backups
- [ ] Implement rate limiting
- [ ] Add input validation and sanitization
- [ ] Enable logging and monitoring
- [ ] Review and update `.gitignore`

---

## 🗄️ Database Setup (Production)

### MySQL Configuration

1. **Create production database:**
```sql
CREATE DATABASE student_transport CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. **Create dedicated database user:**
```sql
CREATE USER 'transport_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON student_transport.* TO 'transport_user'@'localhost';
FLUSH PRIVILEGES;
```

3. **Update `.env` with production credentials:**
```env
MYSQL_HOST=your_db_host
MYSQL_USER=transport_user
MYSQL_PASSWORD=strong_password_here
MYSQL_DATABASE=student_transport
```

4. **Run migrations:**
```bash
python models.py
```

5. **Seed admin account:**
```bash
python seed_admin.py
```

**⚠️ Important:** Change the admin password immediately after first login!

---

## 🐍 Backend Deployment

### Option 1: Traditional Server (Ubuntu/Linux)

1. **Install dependencies:**
```bash
sudo apt update
sudo apt install python3-pip python3-venv nginx
```

2. **Set up application:**
```bash
cd /var/www/transport-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn  # Production WSGI server
```

3. **Create systemd service:**
```bash
sudo nano /etc/systemd/system/transport-api.service
```

```ini
[Unit]
Description=Student Transport API
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/transport-backend
Environment="PATH=/var/www/transport-backend/venv/bin"
ExecStart=/var/www/transport-backend/venv/bin/gunicorn -w 4 -b 127.0.0.1:5000 app:app

[Install]
WantedBy=multi-user.target
```

4. **Start service:**
```bash
sudo systemctl start transport-api
sudo systemctl enable transport-api
```

5. **Configure Nginx:**
```bash
sudo nano /etc/nginx/sites-available/transport-api
```

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/transport-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Option 2: Docker

1. **Create `Dockerfile` in Backend folder:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

2. **Build and run:**
```bash
docker build -t transport-backend .
docker run -d -p 5000:5000 --env-file .env transport-backend
```

### Option 3: Cloud Platforms

#### Heroku
```bash
# Install Heroku CLI
heroku login
heroku create transport-backend

# Add Procfile
echo "web: gunicorn app:app" > Procfile

# Deploy
git push heroku main
```

#### Railway / Render
- Connect GitHub repository
- Set environment variables in dashboard
- Deploy automatically on push

---

## ⚛️ Frontend Deployment

### Option 1: Vercel (Recommended for Next.js)

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Deploy:**
```bash
cd Frontend/my-app
vercel
```

3. **Set environment variables in Vercel dashboard:**
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

4. **Update API calls in code:**
```javascript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
```

### Option 2: Netlify

1. **Build the app:**
```bash
npm run build
```

2. **Deploy:**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Option 3: Traditional Server (Nginx)

1. **Build the app:**
```bash
npm run build
```

2. **Copy build to server:**
```bash
scp -r out/* user@server:/var/www/transport-frontend/
```

3. **Configure Nginx:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/transport-frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 🔐 SSL/HTTPS Setup

### Using Let's Encrypt (Free)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

Certbot will automatically configure Nginx for HTTPS.

---

## 🔧 Production Configuration

### Backend (`app.py`)

Update for production:

```python
# Disable debug mode
app.run(host='0.0.0.0', port=5000, debug=False)

# Configure CORS for specific domains
CORS(app, origins=['https://yourdomain.com'])

# Add rate limiting
from flask_limiter import Limiter
limiter = Limiter(app, key_func=lambda: request.remote_addr)

@app.route('/api/auth/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    # ...
```

### Frontend

Update API URL in all fetch calls:

```javascript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

fetch(`${API_URL}/api/auth/login`, {
  // ...
});
```

---

## 📊 Monitoring & Logging

### Backend Logging

Add to `app.py`:

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

@app.route('/api/auth/login', methods=['POST'])
def login():
    logger.info(f"Login attempt for {request.json.get('email')}")
    # ...
```

### Error Tracking

Consider integrating:
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **DataDog** - Full monitoring

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to server
        run: |
          ssh user@server 'cd /var/www/transport-backend && git pull && systemctl restart transport-api'

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## 📦 Database Backups

### Automated MySQL Backups

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mysql"
DB_NAME="student_transport"

mysqldump -u transport_user -p$DB_PASSWORD $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

Add to crontab:
```bash
0 2 * * * /path/to/backup.sh
```

---

## 🧪 Pre-Deployment Testing

Run these tests before deploying:

```bash
# Backend tests
cd Backend
python -m pytest

# Frontend tests
cd Frontend/my-app
npm test

# Integration tests
curl -X POST https://api.yourdomain.com/api/health
```

---

## 🚀 Deployment Checklist

- [ ] Database configured and migrated
- [ ] Environment variables set
- [ ] SSL certificates installed
- [ ] CORS configured for production domain
- [ ] Debug mode disabled
- [ ] Logging enabled
- [ ] Backups configured
- [ ] Monitoring set up
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Admin password changed
- [ ] API documentation updated
- [ ] DNS records configured
- [ ] Load testing completed

---

## 📱 Mobile App (Future)

For future mobile app deployment:

### React Native
- Build for iOS: `npx react-native run-ios`
- Build for Android: `npx react-native run-android`
- Deploy to App Store / Play Store

### Flutter
- Build: `flutter build apk` / `flutter build ios`
- Deploy to stores

---

## 🆘 Rollback Plan

If deployment fails:

1. **Backend:**
```bash
git revert HEAD
sudo systemctl restart transport-api
```

2. **Frontend:**
```bash
vercel rollback
```

3. **Database:**
```bash
mysql -u transport_user -p student_transport < /backups/mysql/backup_YYYYMMDD.sql
```

---

## 📞 Support

For deployment issues:
- Check logs: `journalctl -u transport-api -f`
- Verify environment variables
- Test database connection
- Check firewall rules
- Review Nginx error logs: `/var/log/nginx/error.log`

---

**Remember:** Always test in a staging environment before deploying to production!
