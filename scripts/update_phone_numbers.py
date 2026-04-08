#!/usr/bin/env python3
"""
Script to update telefone and celular fields in alunos, professores, and supervisores tables.
Appends country code and formats phone numbers based on length.
"""

import mysql.connector
from mysql.connector import Error
import re
import os

def load_env_file(env_path='.env'):
    """Load environment variables from .env file manually."""
    env_vars = {}
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key.strip()] = value.strip().strip('"').strip("'")
    return env_vars

# Load environment variables
env_vars = load_env_file()

def is_properly_formatted(phone):
    """
    Check if phone number is already properly formatted.
    Valid formats: (99) 9999.9999 or (99) 99999.9999
    """
    if not phone:
        return False
    
    # Check for exact format patterns with dot separator
    landline_pattern = r'^\(\d{2}\) \d{4}\.\d{4}$'
    mobile_pattern = r'^\(\d{2}\) \d{5}\.\d{4}$'
    
    if re.match(landline_pattern, phone) or re.match(mobile_pattern, phone):
        return True
    
    return False

def format_phone_number(phone_digits):
    """
    Format phone number based on digit count.
    - 10 digits: (99) 9999.9999 (landline)
    - 11 digits: (99) 99999.9999 (mobile)
    Returns None if digits count is not 10 or 11
    """
    # Remove all non-digit characters
    digits = re.sub(r'\D', '', phone_digits)
    
    if len(digits) == 10:
        # Landline format: (99) 9999.9999
        return f"({digits[:2]}) {digits[2:6]}.{digits[6:]}"
    elif len(digits) == 11:
        # Mobile format: (99) 99999.9999
        return f"({digits[:2]}) {digits[2:7]}.{digits[7:]}"
    else:
        # Cannot format if not 10 or 11 digits
        return None

def get_db_connection():
    """Create database connection."""
    try:
        connection = mysql.connector.connect(
            host=env_vars.get('DB_HOST', 'localhost'),
            port=int(env_vars.get('DB_PORT', 3306)),
            user=env_vars.get('DB_USER'),
            password=env_vars.get('DB_PASSWORD'),
            database=env_vars.get('DB_NAME')
        )
        if connection.is_connected():
            print("Successfully connected to database")
            return connection
    except Error as e:
        print(f"Error connecting to database: {e}")
        return None

def update_table(connection, table_name):
    """Update telefone and celular fields for a given table."""
    cursor = connection.cursor(dictionary=True)
    
    print(f"\nProcessing table: {table_name}")
    print("-" * 50)
    
    updated_count = 0
    error_count = 0
    
    try:
        # Get all records with telefone or celular
        query = f"""
            SELECT id, telefone, celular, codigo_telefone, codigo_celular 
            FROM {table_name}
            WHERE telefone IS NOT NULL AND telefone != '' 
               OR celular IS NOT NULL AND celular != ''
        """
        cursor.execute(query)
        records = cursor.fetchall()
        
        print(f"Found {len(records)} records to process")
        
        for record in records:
            record_id = record['id']
            updates = {}
            
            # Process telefone field
            if record.get('telefone'):
                telefone = str(record['telefone']).strip()
                codigo_telefone = str(record.get('codigo_telefone') or '').strip()
                
                if telefone:
                    # Skip if already properly formatted
                    if is_properly_formatted(telefone):
                        print(f"  ⊘ Record {record_id}: telefone already formatted correctly: {telefone}")
                    else:
                        # Combine codigo + telefone
                        combined = codigo_telefone + telefone if codigo_telefone else telefone
                        
                        # Extract only digits for formatting
                        digits_only = re.sub(r'\D', '', combined)
                        
                        # Format based on length
                        formatted = format_phone_number(digits_only)
                        
                        # Only update if we can format it (10 or 11 digits)
                        if formatted and formatted != telefone:
                            updates['telefone'] = formatted
                        elif not formatted:
                            print(f"  ⚠ Record {record_id}: telefone has {len(digits_only)} digits, cannot format: {telefone}")
            
            # Process celular field
            if record.get('celular'):
                celular = str(record['celular']).strip()
                codigo_celular = str(record.get('codigo_celular') or '').strip()
                
                if celular:
                    # Skip if already properly formatted
                    if is_properly_formatted(celular):
                        print(f"  ⊘ Record {record_id}: celular already formatted correctly: {celular}")
                    else:
                        # Combine codigo + celular
                        combined = codigo_celular + celular if codigo_celular else celular
                        
                        # Extract only digits for formatting
                        digits_only = re.sub(r'\D', '', combined)
                        
                        # Format based on length
                        formatted = format_phone_number(digits_only)
                        
                        # Only update if we can format it (10 or 11 digits)
                        if formatted and formatted != celular:
                            updates['celular'] = formatted
                        elif not formatted:
                            print(f"  ⚠ Record {record_id}: celular has {len(digits_only)} digits, cannot format: {celular}")
            
            # Update record if changes needed
            if updates:
                try:
                    set_clauses = []
                    values = []
                    
                    for field, value in updates.items():
                        set_clauses.append(f"{field} = %s")
                        values.append(value)
                    
                    values.append(record_id)
                    
                    update_query = f"""
                        UPDATE {table_name} 
                        SET {', '.join(set_clauses)}
                        WHERE id = %s
                    """
                    
                    cursor.execute(update_query, values)
                    updated_count += 1
                    
                    print(f"  ✓ Updated record {record_id}: {updates}")
                    
                except Error as e:
                    error_count += 1
                    print(f"  ✗ Error updating record {record_id}: {e}")
        
        # Commit all changes
        connection.commit()
        
        print(f"\nTable {table_name} summary:")
        print(f"  Records processed: {len(records)}")
        print(f"  Records updated: {updated_count}")
        print(f"  Errors: {error_count}")
        
    except Error as e:
        print(f"Error processing table {table_name}: {e}")
        connection.rollback()
    finally:
        cursor.close()

def main():
    """Main function to process all tables."""
    print("=" * 60)
    print("Phone Number Formatter Script")
    print("=" * 60)
    print("\nThis script will:")
    print("1. Read telefone/celular fields from alunos, professores, supervisores")
    print("2. Prepend country codes (codigo_telefone/codigo_celular)")
    print("3. Format as (99) 9999.9999 or (99) 99999.9999")
    print("=" * 60)
    
    # Confirm before proceeding
    confirm = input("\nDo you want to proceed? (yes/no): ").strip().lower()
    if confirm != 'yes':
        print("Operation cancelled.")
        return
    
    connection = get_db_connection()
    if not connection:
        print("Failed to connect to database. Exiting.")
        return
    
    try:
        tables = ['alunos', 'professores', 'supervisores']
        
        for table in tables:
            update_table(connection, table)
        
        print("\n" + "=" * 60)
        print("Script completed successfully!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\nFatal error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if connection.is_connected():
            connection.close()
            print("\nDatabase connection closed.")

if __name__ == "__main__":
    main()
