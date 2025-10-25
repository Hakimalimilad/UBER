"""
Database Diagnostic Tool
Run this to check your database status and identify issues
"""

import mysql.connector
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

def check_database():
    """Check database connection and data."""
    print("=" * 60)
    print("🔍 DATABASE DIAGNOSTIC TOOL")
    print("=" * 60)
    print()
    
    # Check environment variables
    print("📋 Step 1: Checking Environment Variables")
    print("-" * 60)
    db_host = os.getenv('MYSQL_HOST', 'NOT SET')
    db_user = os.getenv('MYSQL_USER', 'NOT SET')
    db_password = os.getenv('MYSQL_PASSWORD', 'NOT SET')
    db_name = os.getenv('MYSQL_DATABASE', 'NOT SET')
    
    print(f"   Host: {db_host}")
    print(f"   User: {db_user}")
    print(f"   Password: {'*' * len(db_password) if db_password != 'NOT SET' else 'NOT SET'}")
    print(f"   Database: {db_name}")
    print()
    
    if 'NOT SET' in [db_host, db_user, db_password, db_name]:
        print("❌ ERROR: .env file is missing or incomplete!")
        print("   Solution: Copy .env.example to .env and configure it")
        return
    
    # Try to connect to MySQL server
    print("📋 Step 2: Testing MySQL Connection")
    print("-" * 60)
    try:
        conn = mysql.connector.connect(
            host=db_host,
            user=db_user,
            password=db_password
        )
        print("✅ Successfully connected to MySQL server")
        conn.close()
    except mysql.connector.Error as e:
        print(f"❌ Failed to connect to MySQL server")
        print(f"   Error: {e}")
        print("   Solution: Make sure MySQL is running and credentials are correct")
        return
    
    # Try to connect to specific database
    print()
    print("📋 Step 3: Testing Database Connection")
    print("-" * 60)
    try:
        conn = mysql.connector.connect(
            host=db_host,
            user=db_user,
            password=db_password,
            database=db_name
        )
        print(f"✅ Successfully connected to database '{db_name}'")
    except mysql.connector.Error as e:
        print(f"❌ Failed to connect to database '{db_name}'")
        print(f"   Error: {e}")
        print(f"   Solution: Create database with: CREATE DATABASE {db_name};")
        return
    
    # Check if tables exist
    print()
    print("📋 Step 4: Checking Database Tables")
    print("-" * 60)
    cursor = conn.cursor()
    cursor.execute("SHOW TABLES")
    tables = cursor.fetchall()
    
    if not tables:
        print("❌ No tables found in database")
        print("   Solution: Run 'python setup_database.py' to create tables")
        cursor.close()
        conn.close()
        return
    
    print(f"✅ Found {len(tables)} table(s):")
    for table in tables:
        print(f"   - {table[0]}")
    
    # Check users table
    print()
    print("📋 Step 5: Checking Users Table")
    print("-" * 60)
    try:
        cursor.execute("SELECT COUNT(*) FROM users")
        total_users = cursor.fetchone()[0]
        print(f"✅ Users table exists")
        print(f"   Total users: {total_users}")
        
        if total_users == 0:
            print()
            print("⚠️  WARNING: No users in database!")
            print("   This is why your admin panel is empty.")
            print()
            print("   Solutions:")
            print("   1. Import data from old laptop (see DATABASE_SETUP_GUIDE.md)")
            print("   2. Create admin account: python seed_admin.py")
            print("   3. Register new users through the frontend")
        else:
            # Show user statistics
            print()
            print("📊 User Statistics:")
            print("-" * 60)
            
            # Count by user type
            cursor.execute("SELECT user_type, COUNT(*) FROM users GROUP BY user_type")
            user_types = cursor.fetchall()
            for user_type, count in user_types:
                print(f"   {user_type.capitalize()}: {count}")
            
            # Count verified users
            cursor.execute("SELECT COUNT(*) FROM users WHERE is_verified = TRUE")
            verified = cursor.fetchone()[0]
            print(f"   Verified: {verified}")
            
            # Count approved users
            cursor.execute("SELECT COUNT(*) FROM users WHERE is_approved = TRUE")
            approved = cursor.fetchone()[0]
            print(f"   Approved: {approved}")
            
            # Count pending users
            cursor.execute("SELECT COUNT(*) FROM users WHERE is_verified = TRUE AND is_approved = FALSE")
            pending = cursor.fetchone()[0]
            print(f"   Pending Approval: {pending}")
            
            # Show recent users
            print()
            print("📋 Recent Users (Last 5):")
            print("-" * 60)
            cursor.execute("""
                SELECT id, email, full_name, user_type, is_verified, is_approved, created_at 
                FROM users 
                ORDER BY created_at DESC 
                LIMIT 5
            """)
            users = cursor.fetchall()
            
            if users:
                for user in users:
                    user_id, email, name, utype, verified, approved, created = user
                    status = []
                    if verified:
                        status.append("✓ Verified")
                    else:
                        status.append("✗ Not Verified")
                    
                    if approved:
                        status.append("✓ Approved")
                    else:
                        status.append("✗ Not Approved")
                    
                    print(f"   ID: {user_id}")
                    print(f"   Email: {email}")
                    print(f"   Name: {name}")
                    print(f"   Type: {utype}")
                    print(f"   Status: {', '.join(status)}")
                    print(f"   Created: {created}")
                    print()
            
            # Check for admin users
            print("📋 Admin Users:")
            print("-" * 60)
            cursor.execute("SELECT email, full_name FROM users WHERE user_type = 'admin'")
            admins = cursor.fetchall()
            
            if admins:
                for email, name in admins:
                    print(f"   ✅ {name} ({email})")
            else:
                print("   ⚠️  No admin users found!")
                print("   Solution: Run 'python seed_admin.py' to create admin account")
    
    except mysql.connector.Error as e:
        print(f"❌ Error checking users table: {e}")
        print("   Solution: Run 'python setup_database.py' to create/fix tables")
    
    cursor.close()
    conn.close()
    
    # Final summary
    print()
    print("=" * 60)
    print("🎯 SUMMARY")
    print("=" * 60)
    
    if total_users == 0:
        print("❌ Your database is EMPTY - this is why admin panel shows no users")
        print()
        print("Next Steps:")
        print("1. Read DATABASE_SETUP_GUIDE.md for detailed instructions")
        print("2. Choose one option:")
        print("   a) Import data from old laptop (recommended)")
        print("   b) Start fresh with new users")
    else:
        print("✅ Your database has users and appears to be working correctly")
        print()
        print("If admin panel still shows no users:")
        print("1. Check browser console for errors (F12)")
        print("2. Check backend logs for API errors")
        print("3. Verify you're logged in as admin")
        print("4. Try clearing browser cache")
    
    print()
    print("=" * 60)


if __name__ == '__main__':
    try:
        check_database()
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        print()
        print("Please check:")
        print("1. MySQL is installed and running")
        print("2. .env file exists and is configured correctly")
        print("3. You're in the Backend directory")
