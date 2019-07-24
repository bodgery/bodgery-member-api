#!/bin/bash
DB=$1

psql -f sql/clear_pg_tables.sql ${DB}
psql -f sql/pg.sql ${DB}
#psql -f sql/test_log_data.sql ${DB}
psql -f node_modules/connect-pg-simple/table.sql ${DB}
