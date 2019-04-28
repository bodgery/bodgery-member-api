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
    "wildapricot_id" int UNIQUE,
    "rfid" text UNIQUE,
    "slack_id" int UNIQUE,
    "address_id" int REFERENCES us_address (id),
    "first_name" text,
    "last_name" text,
    "phone" text,
    "email" text,
    "status" bool DEFAULT TRUE,
    "photo" text
);

CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    password_storage TEXT NOT NULL
);
