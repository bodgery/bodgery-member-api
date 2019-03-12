CREATE TABLE "members" (
  "id" serial primary key,
  "wa_id" int,
  "keyfob_id" int,
  "slack_id" int,
  "first_name" varchar,
  "last_name" varchar,
  "full_name" varchar,
  "status" bool,
  "city" varchar,
  "zip" varchar,
  "photo" varchar,
  "member_level" int
);

CREATE TABLE "member_history" (
  "id" serial primary key,
  "member_id" int,
  "member_start_date" date,
  "member_end_date" date,
  "member_level_id" int,
  "status" bool
);

CREATE TABLE "member_levels" (
  "id" serial primary key,
  "level_name" varchar,
  "level_price" int,
  "level_period" varchar
);

CREATE TABLE "tools" (
  "id" serial primary key,
  "name" varchar,
  "area_id" int,
  "color" varchar,
  "status" varchar,
  "owner_id" int,
  "location" int
);

CREATE TABLE "tool_training" (
  "id" serial primary key,
  "tool_id" int,
  "member_id" int,
  "status" int
);

CREATE TABLE "tool_usage" (
  "id" serial primary key,
  "tool_id" int,
  "member_id" int,
  "usage_date" date,
  "usage_start" timestamp,
  "usage_stop" timestamp,
  "usage_duration" bigint
);

CREATE TABLE "areas" (
  "id" serial primary key,
  "area_name" varchar
);

CREATE TABLE "member_roles" (
  "id" serial primary key,
  "member_id" int,
  "area_id" int,
  "role_id" int,
  "specialty" int,
  "start_date" date,
  "end_date" date
);

CREATE TABLE "roles" (
  "id" serial primary key,
  "role_id" int,
  "role_name" varchar
);

ALTER TABLE "tools" ADD FOREIGN KEY ("owner_id") REFERENCES "members" ("id");

ALTER TABLE "tools" ADD FOREIGN KEY ("area_id") REFERENCES "areas" ("id");

ALTER TABLE "tool_training" ADD FOREIGN KEY ("member_id") REFERENCES "members" ("id");

ALTER TABLE "tool_training" ADD FOREIGN KEY ("tool_id") REFERENCES "tools" ("id");

ALTER TABLE "member_roles" ADD FOREIGN KEY ("member_id") REFERENCES "members" ("id");

ALTER TABLE "member_roles" ADD FOREIGN KEY ("area_id") REFERENCES "areas" ("id");

ALTER TABLE "roles" ADD FOREIGN KEY ("role_id") REFERENCES "member_roles" ("id");

ALTER TABLE "members" ADD FOREIGN KEY ("member_level") REFERENCES "member_levels" ("id");

ALTER TABLE "member_history" ADD FOREIGN KEY ("member_id") REFERENCES "members" ("id");

ALTER TABLE "tool_usage" ADD FOREIGN KEY ("tool_id") REFERENCES "tools" ("id");

ALTER TABLE "tool_usage" ADD FOREIGN KEY ("member_id") REFERENCES "members" ("id");
