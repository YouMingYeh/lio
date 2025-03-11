import { run } from "@/run.js";
import cron from "node-cron";

// Schedule a task to run every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  console.log("Running a task every 5 minutes");
  await run();
});

// Keep the process alive
console.log("Node-cron task scheduled. Waiting for next run...");
