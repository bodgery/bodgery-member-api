#!/bin/bash
DB=$1

psql -f sql/clear_pg_tables.sql ${DB}
psql -f sql/pg.sql ${DB}
