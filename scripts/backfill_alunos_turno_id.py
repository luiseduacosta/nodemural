import argparse
import os
import sys

def _connect(host, user, password, database, port):
    try:
        import mariadb  # type: ignore
    except Exception:
        mariadb = None

    if mariadb is not None:
        return mariadb.connect(
            host=host,
            user=user,
            password=password,
            database=database,
            port=port,
            autocommit=False,
        )

    try:
        import mysql.connector  # type: ignore
    except Exception:
        mysql = None
    else:
        mysql = mysql.connector

    if mysql is not None:
        return mysql.connect(
            host=host,
            user=user,
            password=password,
            database=database,
            port=port,
            autocommit=False,
        )

    try:
        import pymysql  # type: ignore
    except Exception:
        pymysql = None

    if pymysql is not None:
        return pymysql.connect(
            host=host,
            user=user,
            password=password,
            database=database,
            port=port,
            autocommit=False,
        )

    raise RuntimeError(
        "No MariaDB/MySQL driver found. Install one of: mariadb, mysql-connector-python, pymysql"
    )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default=os.environ.get("DB_HOST", "localhost"))
    parser.add_argument("--user", default=os.environ.get("DB_USER", "root"))
    parser.add_argument("--password", default=os.environ.get("DB_PASSWORD", "root"))
    parser.add_argument("--database", default=os.environ.get("DB_NAME", "ess_apps"))
    parser.add_argument("--port", type=int, default=int(os.environ.get("DB_PORT", "3306")))
    args = parser.parse_args()

    sql = """
UPDATE alunos
SET turno_id = CASE
    WHEN turno IS NULL OR TRIM(turno) = '' OR TRIM(turno) = '0' THEN 0
    WHEN LOWER(TRIM(turno)) = 'diurno' THEN 1
    WHEN LOWER(TRIM(turno)) = 'noturno' THEN 2
    WHEN LOWER(TRIM(turno)) = 'ambos' THEN 3
    WHEN LOWER(TRIM(turno)) = 'integral' THEN 4
    ELSE 0
END
"""

    conn = _connect(
        host=args.host,
        user=args.user,
        password=args.password,
        database=args.database,
        port=args.port,
    )
    try:
        cur = conn.cursor()
        cur.execute(sql)
        updated = getattr(cur, "rowcount", None)
        conn.commit()
        if updated is None:
            print("OK")
        else:
            print(f"OK: {updated} rows updated")
    except Exception as e:
        try:
            conn.rollback()
        except Exception:
            pass
        print(str(e), file=sys.stderr)
        sys.exit(1)
    finally:
        try:
            conn.close()
        except Exception:
            pass


if __name__ == "__main__":
    main()
