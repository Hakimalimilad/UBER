# Setup Guide - Step by Step

## Step 1: Install MySQL

### Download MySQL:
1. Go to: https://dev.mysql.com/downloads/installer/
2. Download **MySQL Installer for Windows**
3. Choose "Windows (x86, 32-bit), MSI Installer" (smaller file)

### Install MySQL:
1. Run the installer
2. Choose **"Developer Default"** or **"Server only"**
3. Click **Next** through the installation

### Important - During Installation:
When you see **"Accounts and Roles"** screen:
- **Root Password**: Choose a password (remember this!)
- Example: `root123` or `mypassword`
- **Write it down!** You'll need it later

### Finish Installation:
- Click **Next** until installation completes
- Click **Finish**

### Verify MySQL is Installed:
**Option 1** - Check if MySQL service is running:
1. Press `Windows + R`
2. Type `services.msc` and press Enter
3. Look for **MySQL** or **MySQL80** in the list
4. If it says "Running" → MySQL is installed ✅

**Option 2** - Try command (might not work if PATH not set):
```bash
mysql --version
```
If this gives an error, that's OK! Just check Option 1 instead.

---

## Step 2: Create Database

### Open MySQL Command Line:
1. Search for **"MySQL Command Line Client"** in Windows Start Menu
2. Click to open it
3. Enter your **root password** (the one you set during installation)

### Create Database:
Type this command and press Enter:
```sql
CREATE DATABASE student_transport;
```

You should see: `Query OK, 1 row affected`

### Verify Database Created:
```sql
SHOW DATABASES;
```

You should see `student_transport` in the list.

### Exit MySQL:
```sql
exit
```

---

## Step 3: Create Project Folders

### Create Main Folder:
1. Open File Explorer
2. Go to `C:\Users\YourName\`
3. Create new folder called **`Uber`**

### Create Subfolders:
Inside `Uber` folder, create:
- **`backend`** folder
- **`frontend`** folder

Your structure should look like:
```
C:\Users\YourName\Uber\
├── backend\
└── frontend\
```

---

## Step 4: Copy Project Files

### Files to Copy to `backend` folder:
Copy these files from my laptop to yours:
- `models.py`
- `app.py`
- `requirements.txt`
- `.env.example`

Your `backend` folder should have:
```
backend\
├── models.py
├── app.py
├── requirements.txt
└── .env.example
```

---

## Step 5: Configure Environment

### Create `.env` file:
1. Go to `backend` folder
2. Copy `.env.example` and rename the copy to `.env`
3. Open `.env` in Notepad
4. Edit it:

```env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=root123        # <-- PUT YOUR MYSQL PASSWORD HERE
MYSQL_DATABASE=student_transport

FLASK_SECRET_KEY=my-secret-key-12345
```

**Important**: Change `root123` to YOUR actual MySQL password!

---

## Step 6: Install Python (if not installed)

### Check if Python is installed:
Open Command Prompt:
```bash
python --version
```

If you see `Python 3.x.x`, you're good! Skip to Step 7.

### If Python is NOT installed:
1. Go to: https://www.python.org/downloads/
2. Download **Python 3.11** or **3.12**
3. **IMPORTANT**: Check ✅ **"Add Python to PATH"** during installation
4. Click **Install Now**

---

## Step 7: Install Requirements

### Open Command Prompt in backend folder:
1. Open File Explorer
2. Go to your `backend` folder
3. Click on the address bar, type `cmd`, press Enter

### Create Virtual Environment:
```bash
python -m venv venv
```

Wait for it to finish (takes 1-2 minutes)

### Activate Virtual Environment:
```bash
venv\Scripts\activate
```

You should see `(venv)` at the start of your command line.

### Install Requirements:
```bash
pip install -r requirements.txt
```

Wait for all packages to install (takes 2-3 minutes)

---

## Step 8: Create Database Table

### Run models.py:
```bash
python models.py
```

You should see: `✅ Users table created!`

---

## Step 9: Start the Server

### Run the Flask app:
```bash
python app.py
```

You should see:
```
🚀 Starting Student Transportation Platform...
✅ Users table created!
 * Running on http://0.0.0.0:5000
```

**Don't close this window!** Keep it running.

---

## Step 10: Test It Works

### Open a NEW Command Prompt window

### Test health endpoint:
```bash
curl http://localhost:5000/api/health
```

You should see: `{"status":"ok"}`

### Test register:
```bash
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"test@test.com\",\"password\":\"test123\",\"full_name\":\"Test User\",\"user_type\":\"student\"}"
```

You should get a response with a token!

---

## Troubleshooting

### "MySQL connection failed"
- Check MySQL is running
- Verify password in `.env` file is correct
- Make sure database `student_transport` exists

### "Module not found"
- Make sure virtual environment is activated: `venv\Scripts\activate`
- Run `pip install -r requirements.txt` again

### "Port 5000 already in use"
- Close any other programs using port 5000
- Or change port in `app.py` (line: `app.run(port=5000)`)

### "python not recognized"
- Python not installed or not in PATH
- Reinstall Python and check "Add to PATH"

---

## Quick Reference

### Start the server (every time):
```bash
cd C:\Users\YourName\Uber\backend
venv\Scripts\activate
python app.py
```

### Stop the server:
Press `Ctrl + C` in the terminal

---

## What's Next?

Once this is working, you can:
1. Build the login page (HTML/CSS/JavaScript)
2. Connect it to the API
3. Add more features

---

**Need help? Check the error message and look in Troubleshooting section!**
