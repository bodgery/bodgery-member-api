Implementation of the Bodgery's member API.

After cloning, you'll need to install the dependencies with:

    $ npm install .

You will need a PostgreSQL database setup:

    $ createdb -O USERNAME bodgery_members_USERNAME
    $ sql/rebuild_pg.sh

Replacing `USERNAME` with your own user. You may need sudo access to the 
owner of the database to set this up. We rely on the uuid-ossp extension 
in PostgreSQL, so the superuser will need to ensure the module is loaded 
with:

    > CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

Next, copy `config.yaml.example` to `config.yaml`. Open this file in an 
editor and change the config as necessary.

Then you can run:

    $ npm start

To start the server. You can run the tests with:

    $ npm test


## Docker Instructions

To support development and streamlined deployment, this service can be run in docker containers.

Note: The current setup requires you to first run: `npm install` to pull down some javascript packages used by the docker build.

Building and running both the node-js app-server and the PostgreSQL database server can be accomplished using the following command:

```
docker-compose up

# or to run in the background
docker-compose up -d
```

To re-build containers (for development), use:

```
docker-compose build
docker-compose up
```

### Management Commands

Various management commands and helpers can be run in the dockerized containers.

1. SQL Scripts

```
# Delete (truncate) all the data in the database
docker-compose run db psql < sql/truncate_pg_tables.sql
```

2. Typescript helpers

```
# Add a user to the database
docker-compose run web npx ts-node util/add_user.ts
```

3. TypeORM Generated Code

Re-generate the TypeORM models reflected from the Postgres database.

```
docker-compose run -v $PWD:/code web typeorm-model-generator.sh /code
```
