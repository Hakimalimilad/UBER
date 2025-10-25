#!/usr/bin/env python3
"""
Setup script for the ride management system
Run this after setting up the basic user system
"""

from ride_models import create_ride_tables
from models import create_tables
import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

def setup_ride_system():
    """Setup the ride management system."""
    print("🚀 Setting up Ride Management System...")
    
    try:
        # Create basic tables first
        print("📋 Creating user tables...")
        create_tables()
        
        # Create ride management table
        print("🚗 Creating rides table...")
        create_ride_tables()
        
        # Test database connection
        print("🔍 Testing database connection...")
        conn = mysql.connector.connect(
            host=os.getenv('MYSQL_HOST', 'localhost'),
            user=os.getenv('MYSQL_USER', 'root'),
            password=os.getenv('MYSQL_PASSWORD'),
            database=os.getenv('MYSQL_DATABASE', 'uberdb')
        )
        
        cursor = conn.cursor()
        
        # Check if tables exist
        cursor.execute("SHOW TABLES")
        tables = [table[0] for table in cursor.fetchall()]
        
        required_tables = ['users', 'rides']
        missing_tables = [table for table in required_tables if table not in tables]
        
        if missing_tables:
            print(f"❌ Missing tables: {missing_tables}")
            return False
        
        print("✅ All tables created successfully!")
        
        # Show table structure
        print("\n📊 Database Structure:")
        for table in required_tables:
            cursor.execute(f"DESCRIBE {table}")
            columns = cursor.fetchall()
            print(f"  {table}: {len(columns)} columns")
        
        cursor.close()
        conn.close()
        
        print("\n🎉 Ride Management System setup complete!")
        print("\n📝 Next steps:")
        print("1. Start the backend server: python app.py")
        print("2. Start the frontend: npm run dev")
        print("3. Test the ride request flow")
        print("4. Check email notifications")
        
        return True
        
    except Exception as e:
        print(f"❌ Error setting up ride system: {e}")
        return False

if __name__ == '__main__':
    setup_ride_system()
