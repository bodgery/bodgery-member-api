CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE "us_address" (
    "id" serial primary key,
    "address1" text NOT NULL,
    "address2" text,
    "city" text NOT NULL,
    "state" text NOT NULL,
    "zip" text NOT NULL
);

CREATE TABLE "members" (
    "id" serial primary key,
    "member_id" uuid DEFAULT uuid_generate_v4() UNIQUE,
    "wildapricot_id" text UNIQUE,
    "rfid" text UNIQUE,
    "slack_id" int UNIQUE,
    "address_id" int REFERENCES us_address (id),
    "first_name" text,
    "last_name" text,
    "phone" text,
    "email" text NOT NULL UNIQUE,
    "status" bool DEFAULT FALSE,
    "photo" text
);

CREATE TABLE "users" (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    password_storage TEXT NOT NULL
);

CREATE TABLE "rfid_log" (
    id SERIAL PRIMARY KEY,
    rfid TEXT NOT NULL,
    is_active BOOLEAN NOT NULL,
    -- member_id could be null if the RFID tag doesn't match a member at the 
    -- time of scanning
    member_id INT REFERENCES members (id),
    log_timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "access_token" (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users (id),
    token TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    notes TEXT NOT NULL DEFAULT ''
);


CREATE INDEX member_name ON members (
    last_name
    ,first_name
);
