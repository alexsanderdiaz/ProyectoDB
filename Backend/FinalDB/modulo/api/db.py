from django.db import connection

def run_query(sql, params=None, fetch="all"):
    """
    Ejecuta una consulta SQL cruda y devuelve un dict o lista de dicts.
    """
    with connection.cursor() as cursor:
        cursor.execute(sql, params or {})

        # SELECT ONE
        if fetch == "one":
            row = cursor.fetchone()
            if row is None:
                return None
            cols = [col[0].lower() for col in cursor.description]
            return dict(zip(cols, row))

        # SELECT ALL
        if fetch == "all":
            rows = cursor.fetchall()
            cols = [col[0].lower() for col in cursor.description]
            return [dict(zip(cols, row)) for row in rows]

        return None
