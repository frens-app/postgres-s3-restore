import { CronJob } from "cron";
import { restore } from "./restore.js";
import { env } from "./env.js";

console.log("NodeJS Version: " + process.version);

const tryRestore = async () => {
  try {
    await restore();
  } catch (error) {
    console.error("Error while running restore: ", error);
    process.exit(1);
  }
}

// Handle restore operations
if (env.RUN_RESTORE_ON_STARTUP || env.SINGLE_SHOT_RESTORE_MODE) {
  console.log("Running on start restore...");
  await tryRestore();
  
  if (env.SINGLE_SHOT_RESTORE_MODE) {
    console.log("Database restore complete, exiting...");
    process.exit(0);
  }
}

// Set up restore cron job if schedule is provided
if (env.RESTORE_CRON_SCHEDULE) {
  const restoreJob = new CronJob(env.RESTORE_CRON_SCHEDULE, async () => {
    await tryRestore();
  });
  
  restoreJob.start();
  console.log(`Restore cron scheduled: ${env.RESTORE_CRON_SCHEDULE}`);
}