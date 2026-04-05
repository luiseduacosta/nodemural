#!/usr/bin/env python3
"""
Report script for estagiarios table - supervisor/instituicao consistency check.

This script generates a report with three scenarios:
1. Records with supervisor_id but without instituicao_id
2. Records with instituicao_id but without supervisor_id
3. Records where supervisor_id is not associated with instituicao_id in inst_super table
"""

import mysql.connector
import sys
from datetime import datetime

# Database Configuration (Based on config/app_local.php)
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'root',
    'database': 'mural5'
}


def print_header(title: str) -> None:
    """Print a formatted section header."""
    print("\n" + "=" * 80)
    print(f" {title}")
    print("=" * 80)


def print_record(record: dict, index: int) -> None:
    """Print a single record in a formatted way."""
    print(f"  {index:4d}. ID: {record['id']:5d} | Aluno ID: {record['aluno_id']:5d} | "
          f"Periodo: {record['periodo']} | Nivel: {record['nivel']}")


def generate_report() -> None:
    """Generate the complete report for estagiarios table."""
    print(f"\nReport generated at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("Database: mural5")
    print("Table: estagiarios")

    try:
        # Establish connection
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        print("Successfully connected to the database.\n")

        # =========================================================================
        # REPORT 1: supervisor_id exists but instituicao_id is NULL
        # =========================================================================
        print_header("REPORT 1: Records with supervisor_id but WITHOUT instituicao_id")

        query1 = """
        SELECT id, aluno_id, supervisor_id, instituicao_id, periodo, nivel, registro
        FROM estagiarios
        WHERE supervisor_id IS NOT NULL AND instituicao_id IS NULL
        ORDER BY id
        """
        cursor.execute(query1)
        report1_records = cursor.fetchall()

        if report1_records:
            print(f"\nTotal records found: {len(report1_records)}\n")
            print("Details:")
            for i, record in enumerate(report1_records, 1):
                print(f"  {i:4d}. ID: {record['id']:5d} | Aluno ID: {record['aluno_id']:5d} | "
                      f"Supervisor ID: {record['supervisor_id']:5d} | "
                      f"Periodo: {record['periodo']} | Nivel: {record['nivel']}")
        else:
            print("\nNo records found in this category.")

        # =========================================================================
        # REPORT 2: instituicao_id exists but supervisor_id is NULL
        # =========================================================================
        print_header("REPORT 2: Records with instituicao_id but WITHOUT supervisor_id")

        query2 = """
        SELECT id, aluno_id, supervisor_id, instituicao_id, periodo, nivel, registro
        FROM estagiarios
        WHERE instituicao_id IS NOT NULL AND supervisor_id IS NULL
        ORDER BY id
        """
        cursor.execute(query2)
        report2_records = cursor.fetchall()

        if report2_records:
            print(f"\nTotal records found: {len(report2_records)}\n")
            print("Details:")
            for i, record in enumerate(report2_records, 1):
                print(f"  {i:4d}. ID: {record['id']:5d} | Aluno ID: {record['aluno_id']:5d} | "
                      f"Instituicao ID: {record['instituicao_id']:5d} | "
                      f"Periodo: {record['periodo']} | Nivel: {record['nivel']}")
        else:
            print("\nNo records found in this category.")

        # =========================================================================
        # REPORT 3: supervisor_id is NOT associated with instituicao_id in inst_super
        # =========================================================================
        print_header("REPORT 3: Records where supervisor is NOT linked to instituicao in inst_super")

        query3 = """
        SELECT e.id, e.aluno_id, e.supervisor_id, e.instituicao_id, e.periodo, e.nivel,
               s.nome as supervisor_nome, i.instituicao as instituicao_nome
        FROM estagiarios e
        LEFT JOIN inst_super ins ON e.instituicao_id = ins.instituicao_id
            AND e.supervisor_id = ins.supervisor_id
        LEFT JOIN supervisores s ON e.supervisor_id = s.id
        LEFT JOIN instituicoes i ON e.instituicao_id = i.id
        WHERE e.supervisor_id IS NOT NULL
            AND e.instituicao_id IS NOT NULL
            AND ins.instituicao_id IS NULL
        ORDER BY e.id
        """
        cursor.execute(query3)
        report3_records = cursor.fetchall()

        if report3_records:
            print(f"\nTotal records found: {len(report3_records)}\n")
            print("Details:")
            for i, record in enumerate(report3_records, 1):
                supervisor_nome = record['supervisor_nome'] or 'N/A'
                instituicao_nome = record['instituicao_nome'] or 'N/A'
                print(f"  {i:4d}. ID: {record['id']:5d} | Aluno ID: {record['aluno_id']:5d}")
                print(f"         Supervisor: {record['supervisor_id']:5d} ({supervisor_nome})")
                print(f"         Instituicao: {record['instituicao_id']:5d} ({instituicao_nome})")
                print(f"         Periodo: {record['periodo']} | Nivel: {record['nivel']}")
                print()
        else:
            print("\nNo records found in this category.")

        # =========================================================================
        # SUMMARY
        # =========================================================================
        print_header("SUMMARY")
        print(f"""
  Report 1 (supervisor_id WITHOUT instituicao_id):  {len(report1_records):5d} records
  Report 2 (instituicao_id WITHOUT supervisor_id):  {len(report2_records):5d} records
  Report 3 (supervisor NOT linked to instituicao):  {len(report3_records):5d} records
                                                    -------
  TOTAL ISSUES:                                    {len(report1_records) + len(report2_records) + len(report3_records):5d} records
""")

        # Get total records in estagiarios for context
        cursor.execute("SELECT COUNT(*) as total FROM estagiarios")
        total_records = cursor.fetchone()['total']
        print(f"  Total records in 'estagiarios' table: {total_records}")

    except mysql.connector.Error as err:
        print(f"Database Error: {err}")
        print("Please ensure the MySQL server is running and the database credentials are correct.")
        sys.exit(1)
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        sys.exit(1)
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()
            print("\nDatabase connection closed.")


if __name__ == '__main__':
    # Check if mysql-connector-python is installed
    try:
        import mysql.connector
    except ImportError:
        print("Error: The 'mysql-connector-python' module is not installed.")
        print("Please install it by running: pip install mysql-connector-python")
        sys.exit(1)

    generate_report()
