import { spawnSync } from "node:child_process";

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit", shell: false });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const shouldMigrate =
  process.env.DATABASE_URL &&
  (process.env.NODE_ENV === "production" ||
    process.env.RUN_DB_MIGRATE === "1");

if (shouldMigrate) {
  run("npx", ["prisma", "migrate", "deploy"]);
}

run("npx", ["next", "start"]);
