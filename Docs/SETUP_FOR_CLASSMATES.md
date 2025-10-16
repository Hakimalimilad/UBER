# Quick Setup Guide for Classmates

## 📋 Prerequisites

1. **Python 3.8+** installed
2. **Node.js 18+** installed
3. **MySQL 8.0+** installed

---

## 🚀 Setup Steps (10 Minutes)

### Step 1: Create Database

Open MySQL and run:
```sql
CREATE DATABASE uberdb;
```

**Important:** Database name MUST be `uberdb` (same as the project)

---

### Step 2: Clone Repository

```bash
git clone https://github.com/yourusername/uber-project.git
cd uber-project
```

---

### Step 3: Backend Setup

```bash
# Navigate to Backend
cd Backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate          # Windows
source venv/bin/activate       # Mac/Linux

# Install Python dependencies
pip install -r requirements.txt

# Create .env file from template
copy .env.example .env         # Windows
cp .env.example .env           # Mac/Linux
```

**Edit `.env` file with YOUR MySQL password:**
```env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password_here    # ← Change this!
MYSQL_DATABASE=uberdb                      # ← Keep this same!

FLASK_SECRET_KEY=change-this-to-random-secret-key
```

---

### Step 4: Start Backend

```bash
python app.py
```

**What happens:**
- ✅ Tables are created automatically
- ✅ Server starts on http://localhost:5000
- ✅ You'll see: "🚀 Starting Student Transportation Platform..."

**Leave this terminal running!**

---

### Step 5: Frontend Setup (New Terminal)

```bash
# Navigate to Frontend
cd Frontend

# Install Node dependencies
npm install

# Start development server
npm run dev
```

**Frontend runs on:** http://localhost:3000

**Leave this terminal running too!**

---

### Step 6: Seed Test Accounts (Optional)

Open a **third terminal**:

```bash
cd Backend
venv\Scripts\activate          # Windows
source venv/bin/activate       # Mac/Linux

python seed_admin.py
```

**Test accounts created:**
- Admin: admin@transport.com / admin123
- Student: student@test.com / student123
- Driver: driver@test.com / driver123

---

## 🎉 You're Done!

Open browser and go to: **http://localhost:3000**

Click one of the "Quick Login" buttons to test!

---

## 🐛 Troubleshooting

### Backend won't start?

**Error: "Access denied for user 'root'"**
- ✅ Check your MySQL password in `.env`
- ✅ Make sure MySQL is running

**Error: "Unknown database 'uberdb'"**
- ✅ Create the database: `CREATE DATABASE uberdb;`

**Error: "No module named 'flask'"**
- ✅ Activate virtual environment: `venv\Scripts\activate`
- ✅ Install dependencies: `pip install -r requirements.txt`

---

### Frontend won't start?

**Error: "'next' is not recognized"**
- ✅ Run `npm install` in Frontend folder

**Error: "Port 3000 already in use"**
- ✅ Kill the process or change port in `package.json`

---

### Database connection failed?

**Check these:**
1. MySQL is running
2. Database `uberdb` exists
3. Password in `.env` is correct
4. User is `root` (or change in `.env`)

---

## 📂 Project Structure

```
uber-project/
├── Backend/           # Flask API
│   ├── app.py        # Main application (run this!)
│   ├── models.py     # Database functions
│   ├── seed_admin.py # Create test accounts
│   └── .env          # Your configuration (create from .env.example)
│
└── Frontend/         # Next.js UI
    ├── app/          # Pages
    └── package.json  # Dependencies
```

---

## 🔑 Important Notes

1. **Database name MUST be `uberdb`** - Everyone uses the same name
2. **Password is YOUR MySQL password** - Everyone has their own
3. **Don't commit `.env` file** - It's in .gitignore for security
4. **Tables auto-create** - No need to run SQL scripts manually!

---

## 🆘 Need Help?

1. Check `README.md` for detailed documentation
2. Check `QUICK_REFERENCE.md` for common commands
3. Check `API_DOCUMENTATION.md` for API details

---

**Setup time: ~10 minutes**  
**Questions? Ask in class!** 🎓
