# 🚀 Quick Start Guide

## First Time Setup on New Laptop

### 1️⃣ Check Your Database Status
```bash
cd d:\Uber\Backend
python check_database.py
```

This will tell you:
- ✅ If MySQL is connected
- ✅ If database exists
- ✅ How many users you have
- ✅ What's wrong (if anything)

---

### 2️⃣ If Database is Empty (Most Common Issue)

**You have TWO options:**

#### Option A: Import Data from Old Laptop ⭐ RECOMMENDED

**On OLD laptop:**
```bash
cd Desktop
mysqldump -u root -p221180407 uberdb > uberdb_backup.sql
```

**Transfer file to NEW laptop, then:**
```bash
cd Desktop  # or wherever you put the file
mysql -u root -p221180407 uberdb < uberdb_backup.sql
```

**Verify:**
```bash
cd d:\Uber\Backend
python check_database.py
```

#### Option B: Start Fresh
```bash
cd d:\Uber\Backend
python setup_database.py
python seed_admin.py
```

Then register new users through the website.

---

### 3️⃣ Start the Application

**Terminal 1 - Backend:**
```bash
cd d:\Uber\Backend
.\venv\Scripts\Activate
python app.py
```

**Terminal 2 - Frontend:**
```bash
cd d:\Uber\Frontend
npm start
```

---

## Common Issues & Quick Fixes

### ❌ "No users showing in admin panel"
**Cause:** Empty database on new laptop  
**Fix:** Import data from old laptop (see Option A above)

### ❌ "Can't connect to MySQL"
**Cause:** MySQL not running  
**Fix:** 
```bash
net start MySQL80
```

### ❌ "Database 'uberdb' doesn't exist"
**Fix:**
```bash
mysql -u root -p
CREATE DATABASE uberdb;
exit;
python setup_database.py
```

### ❌ ".env file missing"
**Fix:**
```bash
cd d:\Uber\Backend
copy .env.example .env
# Edit .env with your MySQL password
```

---

## Daily Development Workflow

```bash
# Start backend
cd d:\Uber\Backend
.\venv\Scripts\Activate
python app.py

# In new terminal, start frontend
cd d:\Uber\Frontend
npm start
```

---

## Useful Commands

```bash
# Check database status
python check_database.py

# Reset database (⚠️ DELETES ALL DATA)
python reset_database.py

# Create admin account
python seed_admin.py

# View users in MySQL
mysql -u root -p uberdb
SELECT * FROM users;
```

---

## 📚 Need More Help?

- **Detailed guide:** Read `DATABASE_SETUP_GUIDE.md`
- **Database issues:** Run `python check_database.py`
- **Setup from scratch:** Follow `DATABASE_SETUP_GUIDE.md` step-by-step

---

## 🎯 Understanding the Issue

```
OLD LAPTOP                    NEW LAPTOP
┌─────────────┐              ┌─────────────┐
│   Code      │─────Git─────▶│   Code      │  ✅ Synced
└─────────────┘              └─────────────┘

┌─────────────┐              ┌─────────────┐
│  MySQL DB   │              │  MySQL DB   │
│  (Has Users)│──────✗──────▶│  (Empty!)   │  ❌ NOT Synced
└─────────────┘              └─────────────┘
```

**The Problem:** Git syncs code, but NOT the database!  
**The Solution:** Export/Import database manually OR start fresh.
