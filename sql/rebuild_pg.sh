#!/bin/bash
# TODO
# Whatever tools are used to get the DB user/pass out of the config, we need 
# to make sure they're available on a wide variety of installations. They 
# should also parse YAML entirely, rather than this crude method.
DB=`grep "db_name:" config.yaml | perl -E 'say( (split /:\s*/, <>)[1] )'`
DB_USER=`grep "db_user:" config.yaml | perl -E 'say( (split /:\s*/, <>)[1] )'`
DB_PASS=`grep "db_password:" config.yaml | perl -E 'say( (split /:\s*/, <>)[1] )'`

psql -f sql/clear_pg_tables.sql ${DB}
psql -f sql/pg.sql ${DB}
#psql -f sql/test_log_data.sql ${DB}

npx typeorm-model-generator \
    -h localhost \
    -d ${DB} \
    -u ${DB_USER} \
    -x ${DB_PASS} \
    -e postgres \
    -o src/typeorm \
    -s public
