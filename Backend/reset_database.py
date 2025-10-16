"""
Database Reset Script - Clean and recreate database
Run this to completely reset the database: python reset_database.py
"""

import mysql.connector
import os
import sys
from dotenv import load_dotenv

load_dotenv()

def reset_database():
    """Completely reset the database."""

    # Database configuration
    host = os.getenv('MYSQL_HOST', 'localhost')
    user = os.getenv('MYSQL_USER', 'root')
    password = os.getenv('MYSQL_PASSWORD')
    database = os.getenv('MYSQL_DATABASE', 'uberdb')

    print("🗑️  Database Reset Script")
    print("=" * 50)

    try:
        # Connect to MySQL server (without specifying database)
        conn = mysql.connector.connect(
            host=host,
            user=user,
            password=password
        )

        cursor = conn.cursor()

        print(f"📦 Connected to MySQL server")

        # Drop database if exists
        print(f"🗑️  Dropping database '{database}' if it exists...")
        cursor.execute(f"DROP DATABASE IF EXISTS {database}")

        # Create fresh database
        print(f"🆕 Creating fresh database '{database}'...")
        cursor.execute(f"CREATE DATABASE {database}")

        print(f"✅ Database '{database}' reset successfully!")

        # Close connection
        cursor.close()
        conn.close()

        print("\n🚀 Next steps:")
        print("1. Run: python models.py")
        print("2. Run: python seed_admin.py")
        print("3. Start your application")

        return True

    except mysql.connector.Error as err:
        print(f"❌ Database error: {err}")
        print("\n💡 Make sure:")
        print("- MySQL server is running")
        print("- Your credentials in .env are correct")
        print("- You have sufficient privileges")
        return False
    except Exception as err:
        print(f"❌ Unexpected error: {err}")
        return False

def clean_database():
    """Alternative: Just clear all data but keep structure."""

    host = os.getenv('MYSQL_HOST', 'localhost')
    user = os.getenv('MYSQL_USER', 'root')
    password = os.getenv('MYSQL_PASSWORD')
    database = os.getenv('MYSQL_DATABASE', 'uberdb')

    print("🧹 Database Cleanup Script")
    print("=" * 50)

    try:
        # Connect to database
        conn = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            database=database
        )

        cursor = conn.cursor()

        print(f"📦 Connected to database '{database}'")

        # Get all tables
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()

        if not tables:
            print("📭 No tables found - database is already clean")
            return True

        print(f"🗑️  Found {len(tables)} tables to clean")

        # Disable foreign key checks
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0")

        # Drop all tables
        for (table_name,) in tables:
            print(f"   - Dropping table: {table_name}")
            cursor.execute(f"DROP TABLE IF EXISTS {table_name}")

        # Re-enable foreign key checks
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1")

        conn.commit()
        cursor.close()
        conn.close()

        print("✅ All tables cleared successfully!")

        print("\n🚀 Next steps:")
        print("1. Run: python seed_admin.py")
        print("2. Start your application")

        return True

    except mysql.connector.Error as err:
        print(f"❌ Database error: {err}")
        print("\n💡 Make sure:")
        print("- Database exists")
        print("- Your credentials in .env are correct")
        print("- You have sufficient privileges")
        return False
    except Exception as err:
        print(f"❌ Unexpected error: {err}")
        return False

if __name__ == '__main__':
    print("Choose an option:")
    print("1. Complete reset (drop and recreate database)")
    print("2. Clean data only (keep database structure)")

    choice = input("\nEnter your choice (1 or 2): ").strip()

    if choice == '1':
        success = reset_database()
    elif choice == '2':
        success = clean_database()
    else:
        print("❌ Invalid choice. Please enter 1 or 2.")
        sys.exit(1)

    if success:
        print("\n🎉 Database operation completed successfully!")
    else:
        print("\n❌ Database operation failed!")
        sys.exit(1)
