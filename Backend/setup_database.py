"""
Quick Database Setup - One command to rule them all
Run this for a fresh start: python setup_database.py
"""

import mysql.connector
import os
import sys
from models import create_tables
from seed_admin import seed_admin, seed_test_users

def run_command(cmd, description):
    """Run a command and show progress."""
    print(f" {description}...")
    try:
        # Import and run functions directly instead of subprocess
        if "models.py" in cmd:
            create_tables()
        elif "seed_admin.py" in cmd:
            seed_admin()
            # No test users - only unified admin
        else:
            print(f" Unknown command: {cmd}")
            return False

        print(f" {description} completed!")
        return True

    except Exception as e:
        print(f" {description} failed!")
        print(f"Error: {e}")
        return False

def reset_database():
    """Reset database without user interaction."""
    try:
        # Database configuration
        host = os.getenv('MYSQL_HOST', 'localhost')
        user = os.getenv('MYSQL_USER', 'root')
        password = os.getenv('MYSQL_PASSWORD')
        database = os.getenv('MYSQL_DATABASE', 'uberdb')

        print(f" Connecting to MySQL server...")

        # Connect to MySQL server (without specifying database)
        conn = mysql.connector.connect(
            host=host,
            user=user,
            password=password
        )

        cursor = conn.cursor()

        # Drop database if exists
        print(f"  Dropping database '{database}' if it exists...")
        cursor.execute(f"DROP DATABASE IF EXISTS {database}")

        # Create fresh database
        print(f" Creating fresh database '{database}'...")
        cursor.execute(f"CREATE DATABASE {database}")

        print(f" Database '{database}' reset successfully!")

        # Close connection
        cursor.close()
        conn.close()

        return True

    except mysql.connector.Error as err:
        print(f" Database error: {err}")
        return False
    except Exception as err:
        print(f" Unexpected error: {err}")
        return False

def main():
    """Complete database setup in one command."""
    print(" Complete Database Setup")
    print("=" * 50)

    # Change to Backend directory
    backend_dir = os.path.dirname(__file__)
    os.chdir(backend_dir)

    # Step 1: Reset database
    if not reset_database():
        print(" Database reset failed!")
        return False

    # Step 2: Create tables
    if not run_command("python models.py", "Create tables"):
        return False

    # Step 3: Seed accounts
    if not run_command("python seed_admin.py", "Seed admin accounts"):
        return False

    print("\n Complete database setup successful!")
    print("=" * 50)
    print(" Database reset and recreated")
    print(" Tables created")
    print(" Unified admin account seeded")
    print("\n Ready to use:")
    print("   Backend: python app.py")
    print("   Frontend: npm run dev")
    print("\n Unified Admin Account:")
    print(f"   Admin:   {os.getenv('ADMIN_EMAIL', 'ethiraaount@gmail.com')} / {os.getenv('ADMIN_PASSWORD', '221180407')}")

    return True

if __name__ == '__main__':
    success = main()
    if not success:
        print("\n Setup failed!")
        sys.exit(1)
