"""
Seed Admin Account - Creates default admin user for production
Run this once to create an admin account: python seed_admin.py
"""

from models import create_user, get_user_by_email
import os
from dotenv import load_dotenv

load_dotenv()

def seed_admin():
    """Create default admin account using environment variables."""

    admin_email = os.getenv('ADMIN_EMAIL', 'admin@yourdomain.com')
    admin_password = os.getenv('ADMIN_PASSWORD', 'changeme123')
    admin_name = os.getenv('ADMIN_NAME', 'Administrator')

    print("🌱 Seeding admin account...")

    # Check if admin already exists
    existing_admin = get_user_by_email(admin_email)
    if existing_admin:
        print(f"⚠️  Admin account already exists: {admin_email}")
        print(f"   User ID: {existing_admin['id']}")
        print(f"   Name: {existing_admin['full_name']}")
        print(f"   Type: {existing_admin['user_type']}")
        return

    # Create admin user
    try:
        user_id = create_user(
            email=admin_email,
            password=admin_password,
            full_name=admin_name,
            user_type='admin'
        )

        print("✅ Admin account created successfully!")
        print(f"   Email: {admin_email}")
        print(f"   Password: {admin_password}")
        print(f"   User ID: {user_id}")
        print("\n⚠️  IMPORTANT: Change this password after first login!")

    except Exception as e:
        print(f"❌ Error creating admin: {e}")


if __name__ == '__main__':
    print("=" * 60)
    print("Student Transport Platform - Admin Seeding")
    print("=" * 60)

    try:
        seed_admin()

        print("\n" + "=" * 60)
        print("✅ Admin seeding complete!")
        print("=" * 60)
        print("\nAdmin Account:")
        print(f"  Admin:   {os.getenv('ADMIN_EMAIL', 'admin@yourdomain.com')} / {os.getenv('ADMIN_PASSWORD', 'changeme123')}")
        print("\n⚠️  Remember to change passwords in production!")

    except Exception as e:
        print(f"\n❌ Seeding failed: {e}")
        print("Make sure the database is running and tables are created.")
