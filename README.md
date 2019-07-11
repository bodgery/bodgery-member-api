Implementation of the Bodgery's member API.

After cloning, you'll need to install the dependencies with:

    $ npm install .

You will need a PostgreSQL database setup:

    $ createdb -O USERNAME bodgery_members_USERNAME
    $ sql/rebuild_pg.sh bodgery_members_USERNAME

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
