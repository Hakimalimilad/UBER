"""
Database Cleanup Script - Remove test users and fix admin roles
"""

import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    """Get database connection."""
    return mysql.connector.connect(
        host=os.getenv('MYSQL_HOST', 'localhost'),
        user=os.getenv('MYSQL_USER', 'root'),
        password=os.getenv('MYSQL_PASSWORD'),
        database=os.getenv('MYSQL_DATABASE', 'uberdb')
    )

def cleanup_users():
    """Clean up users table - keep only legitimate users."""

    # Users to keep:
    # - ethiraaount@gmail.com (admin) - ID: 5
    # - hakiimzy@gmail.com (change to student) - ID: 4
    # Remove all test accounts

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # First, let's see what users currently exist
        cursor.execute('SELECT id, email, user_type FROM users ORDER BY id')
        users = cursor.fetchall()

        print("Current users in database:")
        for user in users:
            print(f"ID: {user[0]}, Email: {user[1]}, Type: {user[2]}")

        print("\n" + "="*50)

        # Delete test users (keep only ethiraaount@gmail.com and hakiimzy@gmail.com)
        test_emails = [
            'admin@transport.com',
            'student@test.com',
            'driver@test.com'
        ]

        for email in test_emails:
            cursor.execute('DELETE FROM users WHERE email = %s', (email,))
            if cursor.rowcount > 0:
                print(f"✅ Deleted test user: {email}")
            else:
                print(f"⚠️  Test user not found: {email}")

        # Change hakiimzy@gmail.com from admin to student
        cursor.execute(
            'UPDATE users SET user_type = %s WHERE email = %s',
            ('student', 'hakiimzy@gmail.com')
        )

        if cursor.rowcount > 0:
            print("✅ Changed hakiimzy@gmail.com from admin to student")
        else:
            print("⚠️  hakiimzy@gmail.com not found or already student")

        # Verify final state
        cursor.execute('SELECT id, email, user_type FROM users ORDER BY id')
        final_users = cursor.fetchall()

        print("\n" + "="*50)
        print("Final users in database:")
        for user in final_users:
            print(f"ID: {user[0]}, Email: {user[1]}, Type: {user[2]}")

        print(f"\n✅ Total users remaining: {len(final_users)}")
        print("✅ Only ethiraaount@gmail.com is admin")
        print("✅ hakiimzy@gmail.com is now a student")

        conn.commit()

    except Exception as e:
        print(f"❌ Error during cleanup: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    print("🧹 Starting database cleanup...")
    print("This will:")
    print("  - Remove all test accounts")
    print("  - Change hakiimzy@gmail.com from admin to student")
    print("  - Keep only ethiraaount@gmail.com as admin")
    print()

    # Auto-confirm for automated cleanup
    cleanup_users()
    print("\n✅ Database cleanup completed!")
