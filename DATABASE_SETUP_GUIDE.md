# Database Setup Guide for New Environments

## 🔍 Understanding the Issue

### What Happened?
When you cloned your project from GitHub to a new laptop, you noticed:
- ✅ Users can sign in successfully
- ❌ Admin panel shows NO users in user management
- ❌ Pending users page is empty

### Why This Happens?
Your project uses **MySQL database**, which is **NOT stored in your project files**. Here's what's different:

| What Gets Cloned | What Doesn't Get Cloned |
|------------------|-------------------------|
| ✅ Python code files | ❌ `.env` file (database credentials) |
| ✅ Frontend files | ❌ MySQL database data |
| ✅ Configuration examples | ❌ User accounts |
| ✅ Requirements.txt | ❌ Any stored records |

**Result:** You have two completely separate MySQL databases on two different laptops!

---

## 🎯 The Solution: Choose Your Approach

### Option 1: Export & Import Database (Recommended)
**Use this if you want to move ALL data from old laptop to new laptop**

#### Step 1: Export Database from Old Laptop
```bash
# On your OLD laptop, open Command Prompt/PowerShell
# Navigate to a folder where you want to save the export
cd Desktop

# Export the entire database
mysqldump -u root -p uberdb > uberdb_backup.sql
# Enter password when prompted: 221180407
```

#### Step 2: Transfer the File
- Copy `uberdb_backup.sql` to your new laptop (USB drive, cloud, etc.)

#### Step 3: Import Database on New Laptop
```bash
# On your NEW laptop
# First, make sure MySQL is running and database exists
mysql -u root -p

# In MySQL prompt:
CREATE DATABASE IF NOT EXISTS uberdb;
exit;

# Now import the data
mysql -u root -p uberdb < uberdb_backup.sql
# Enter password: 221180407
```

#### Step 4: Verify
```bash
# Check if data was imported
mysql -u root -p uberdb
# Enter password

# In MySQL prompt:
SELECT COUNT(*) FROM users;
SELECT email, full_name, user_type FROM users;
exit;
```

---

### Option 2: Start Fresh on New Laptop
**Use this if you want to start with a clean database**

#### Step 1: Setup Database
```bash
cd d:\Uber\Backend

# Activate virtual environment
.\venv\Scripts\Activate

# Create tables
python setup_database.py

# Create admin account
python seed_admin.py
```

#### Step 2: Register New Users
- Users need to register again through the frontend
- Admin needs to approve them

---

### Option 3: Sync Databases Regularly (Advanced)
**Use this if you need to work on both laptops**

Consider using:
- **Cloud MySQL** (AWS RDS, Google Cloud SQL, Azure Database)
- **Remote MySQL** (configure one laptop as server, other as client)
- **Database migration tools** (Flyway, Liquibase)

---

## 🔧 Setting Up New Environment (Step-by-Step)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd Uber
```

### 2. Setup Backend
```bash
cd Backend

# Create virtual environment
python -m venv venv

# Activate it
.\venv\Scripts\Activate  # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure Environment Variables
```bash
# Copy the example file
copy .env.example .env  # Windows
# cp .env.example .env  # Mac/Linux

# Edit .env file with your settings
# Make sure MySQL credentials match your local MySQL installation
```

### 4. Setup MySQL Database
```bash
# Option A: Create empty database
mysql -u root -p
CREATE DATABASE uberdb;
exit;

# Then run setup
python setup_database.py
python seed_admin.py

# Option B: Import existing database (if you have backup)
mysql -u root -p uberdb < path/to/backup.sql
```

### 5. Start Backend Server
```bash
python app.py
# Should see: Running on http://127.0.0.1:5000
```

### 6. Setup Frontend
```bash
# Open new terminal
cd d:\Uber\Frontend

# Install dependencies
npm install

# Start frontend
npm start
# Should open http://localhost:3000
```

---

## 🐛 Troubleshooting

### Issue: "Can't connect to MySQL server"
**Solution:**
```bash
# Check if MySQL is running
# Windows: Open Services, look for MySQL
# Or start it manually:
net start MySQL80  # or your MySQL service name
```

### Issue: "Access denied for user 'root'"
**Solution:**
- Check your `.env` file has correct password
- Default in `.env.example` is `221180407`
- Make sure it matches your MySQL root password

### Issue: "Database 'uberdb' doesn't exist"
**Solution:**
```bash
mysql -u root -p
CREATE DATABASE uberdb;
exit;
python setup_database.py
```

### Issue: "Users can login but don't show in admin panel"
**Solution:**
- You're looking at an EMPTY database on new laptop
- Old laptop has the users in ITS database
- Follow **Option 1** above to export/import data

### Issue: "Table 'users' doesn't exist"
**Solution:**
```bash
python setup_database.py
```

---

## 📋 Quick Checklist for New Setup

- [ ] MySQL installed and running
- [ ] Repository cloned
- [ ] Backend virtual environment created
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] `.env` file created and configured
- [ ] Database created in MySQL
- [ ] Tables created (`python setup_database.py`)
- [ ] Admin account created (`python seed_admin.py`)
- [ ] Backend server running (`python app.py`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Frontend running (`npm start`)

---

## 🔐 Important Security Notes

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Change default passwords** in production
3. **Use strong SECRET_KEY** for Flask
4. **Don't share database credentials** publicly

---

## 📊 Database Schema Reference

### Users Table
```sql
- id (INT, PRIMARY KEY)
- email (VARCHAR, UNIQUE)
- password_hash (VARCHAR)
- full_name (VARCHAR)
- user_type (ENUM: 'student', 'driver', 'admin')
- is_verified (BOOLEAN)
- is_approved (BOOLEAN)
- created_at (TIMESTAMP)
- ... (student/driver specific fields)
```

---

## 🎓 Understanding Your Architecture

```
┌─────────────────┐
│   Frontend      │  (React - Port 3000)
│   (localhost)   │
└────────┬────────┘
         │ HTTP Requests
         ▼
┌─────────────────┐
│   Backend       │  (Flask - Port 5000)
│   (Python)      │
└────────┬────────┘
         │ SQL Queries
         ▼
┌─────────────────┐
│   MySQL DB      │  (Port 3306)
│   (Local)       │  ⚠️ NOT in Git!
└─────────────────┘
```

**Key Point:** Each laptop has its OWN MySQL database. They don't sync automatically!

---

## 💡 Best Practices for Multi-Device Development

### Option A: Use One Laptop as Primary
- Do all development on one laptop
- Use the other only for testing/viewing
- Push code to GitHub, but keep database on primary laptop

### Option B: Cloud Database
- Set up MySQL on cloud (AWS RDS, DigitalOcean, etc.)
- Both laptops connect to same cloud database
- Update `.env` with cloud database credentials

### Option C: Regular Exports
- Export database weekly: `mysqldump -u root -p uberdb > backup_YYYYMMDD.sql`
- Store backups in secure location (NOT in Git)
- Import when switching laptops

---

## 📞 Need Help?

Common commands:
```bash
# Check MySQL status
mysql -u root -p -e "SELECT VERSION();"

# List all databases
mysql -u root -p -e "SHOW DATABASES;"

# Check tables in uberdb
mysql -u root -p uberdb -e "SHOW TABLES;"

# Count users
mysql -u root -p uberdb -e "SELECT COUNT(*) FROM users;"

# View all users
mysql -u root -p uberdb -e "SELECT id, email, full_name, user_type, is_verified, is_approved FROM users;"
```
