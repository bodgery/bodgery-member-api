CREATE TABLE "us_address" (
    "id" serial primary key,
    "address1" text,
    "address2" text,
    "city" text,
    "state" text,
    "zip" text,
    "county" text,
    "country" text
);

CREATE TABLE "members" (
    "id" serial primary key,
    "member_id" uuid DEFAULT uuid_generate_v4(),
    "wildapricot_id" int,
    "rfid" text,
    "slack_id" int,
    "address_id" int REFERENCES us_address (id),
    "first_name" text,
    "last_name" text,
    "phone" text,
    "email" text,
    "status" bool,
    "photo" text
);

CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    password_storage TEXT NOT NULL
);
