CREATE TABLE "members" (
  "member_id" int,
  "wa_id" int,
  "keyfob_id" int,
  "slack_id" int,
  "first_name" varchar,
  "last_name" varchar,
  "full_name" varchar,
  "status" bool,
  "city" varchar,
  "zip" int,
  "photo" varchar,
  "member_level" int
);

CREATE TABLE "member_history" (
  "id" int,
  "member_id" int,
  "member_start_date" date,
  "member_end_date" date,
  "member_level" int,
  "status" bool
);

CREATE TABLE "member_levels" (
  "level_id" int,
  "level_name" varchar,
  "level_price" int,
  "level_period" varchar
);

CREATE TABLE "tools" (
  "tool_id" int,
  "name" varchar,
  "area_id" int,
  "color" varchar,
  "status" varchar,
  "owner_id" varchar,
  "location" int
);

CREATE TABLE "tool_training" (
  "member_id" int,
  "tool_id" int,
  "status" int
);

CREATE TABLE "tool_usage" (
  "id" int,
  "tool_id" int,
  "member_id" int,
  "usage_date" date,
  "usage_start" timestamp,
  "usage_stop" timestamp,
  "usage_duration" double
);

CREATE TABLE "areas" (
  "area_id" int,
  "area_name" varchar
);

CREATE TABLE "member_roles" (
  "id" int,
  "member_id" int,
  "area_id" int,
  "role" int,
  "specialty" int,
  "start_date" date,
  "end_Date" date
);

CREATE TABLE "roles" (
  "id" int,
  "role_name" varchar
);

ALTER TABLE "tools" ADD FOREIGN KEY ("owner_id") REFERENCES "members" ("member_id");

ALTER TABLE "tools" ADD FOREIGN KEY ("area_id") REFERENCES "areas" ("area_id");

ALTER TABLE "tool_training" ADD FOREIGN KEY ("member_id") REFERENCES "members" ("member_id");

ALTER TABLE "tool_training" ADD FOREIGN KEY ("tool_id") REFERENCES "tools" ("tool_id");

ALTER TABLE "member_roles" ADD FOREIGN KEY ("member_id") REFERENCES "members" ("member_id");

ALTER TABLE "member_roles" ADD FOREIGN KEY ("area_id") REFERENCES "areas" ("area_id");

ALTER TABLE "roles" ADD FOREIGN KEY ("id") REFERENCES "member_roles" ("role");

ALTER TABLE "members" ADD FOREIGN KEY ("member_level") REFERENCES "member_levels" ("level_id");

ALTER TABLE "member_history" ADD FOREIGN KEY ("member_id") REFERENCES "members" ("member_id");

ALTER TABLE "tool_usage" ADD FOREIGN KEY ("tool_id") REFERENCES "tools" ("tool_id");

ALTER TABLE "tool_usage" ADD FOREIGN KEY ("member_id") REFERENCES "members" ("member_id");