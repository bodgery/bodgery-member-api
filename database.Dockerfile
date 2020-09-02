FROM postgres:alpine

ADD sql/pg.sql /docker-entrypoint-initdb.d/01_create_tables.sql
ADD node_modules/connect-pg-simple/table.sql /docker-entrypoint-initdb.d/02_sessions.sql
