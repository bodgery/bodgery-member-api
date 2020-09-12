FROM postgres:alpine

ADD sql/pg.sql /docker-entrypoint-initdb.d/01_create_tables.sql
