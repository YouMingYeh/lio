import { getJobs } from "@/repositories/job-repository.js";
import { runCronJob, runOneTimeJob } from "@/services/job-service.js";
import { CronJob, OneTimeJob } from "@/types.js";
import { validate } from "node-cron";

export async function run() {
  const currentTaipeiTime = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Taipei",
  });
  console.log(`Current Taipei time: ${currentTaipeiTime}`);

  const { data: jobs } = await getJobs();
  if (!jobs) {
    console.log("No jobs found.");
    return;
  }

  for (const job of jobs) {
    if (job.status === "completed") {
      console.log(`Job ${job.id} has already completed.`);
      continue;
    }
    if (job.status === "failed") {
      console.error(`Job ${job.id} has failed.`);
      continue;
    }
    const matched =
      job.type === "cron"
        ? isCronScheduleMatched(job.schedule)
        : isOneTimeJobScheduleMatched(job.schedule);
    if (!matched) {
      console.log(`Job ${job.id} is not scheduled to run now.`);
      continue;
    }
    if (job.type === "cron") {
      console.log(job);
      await runCronJob(job as CronJob);
    } else if (job.type === "one-time") {
      console.log(job);
      await runOneTimeJob(job as OneTimeJob);
    } else {
      console.error(`Unknown job type: ${job.type}`);
    }
  }

  console.log("All jobs completed.");
  return;
}

function isCronScheduleMatched(cronExpression: string): boolean {
  // Validate the cron expression first
  if (!validate(cronExpression)) {
    console.error(`Invalid cron expression: ${cronExpression}`);
    return false;
  }

  // Get current time components in Taipei timezone
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Taipei" }),
  );
  const minute = now.getMinutes();
  const hour = now.getHours();
  const dayOfMonth = now.getDate();
  const month = now.getMonth() + 1; // JavaScript months are 0-indexed
  const dayOfWeek = now.getDay();

  // Parse the cron expression
  const parts = cronExpression.split(" ");
  if (parts.length < 5) {
    console.error(`Invalid cron expression format: ${cronExpression}`);
    return false;
  }

  const [cronMinute, cronHour, cronDayOfMonth, cronMonth, cronDayOfWeek] =
    parts.map((part) => part || "*"); // Replace undefined values with '*'

  // Helper function to check if a value matches a cron part
  const matches = (value: number, cronPart: string | undefined): boolean => {
    // If cronPart is undefined, treat it as '*' (match everything)
    if (cronPart === undefined) return true;
    if (cronPart === "*") return true;

    // Handle lists (e.g., "1,3,5")
    if (cronPart.includes(",")) {
      return cronPart.split(",").some((v) => parseInt(v, 10) === value);
    }

    // Handle ranges (e.g., "1-5")
    if (cronPart.includes("-")) {
      const parts = cronPart.split("-");
      if (
        parts.length === 2 &&
        parts[0] !== undefined &&
        parts[1] !== undefined
      ) {
        const start = parseInt(parts[0], 10);
        const end = parseInt(parts[1], 10);
        return !isNaN(start) && !isNaN(end) && value >= start && value <= end;
      }
      return false;
    }

    // Handle steps (e.g., "*/5")
    if (cronPart.includes("/")) {
      const [range, step] = cronPart.split("/");
      if (step !== undefined) {
        const stepInt = parseInt(step, 10);

        if (range === "*") {
          return value % stepInt === 0;
        }
      }
    }

    // Simple value
    return parseInt(cronPart, 10) === value;
  };

  // Check if current time matches the cron expression
  return (
    matches(minute, cronMinute) &&
    matches(hour, cronHour) &&
    matches(dayOfMonth, cronDayOfMonth) &&
    matches(month, cronMonth) &&
    matches(dayOfWeek, cronDayOfWeek)
  );
}

function isOneTimeJobScheduleMatched(schedule: string): boolean {
  try {
    // Parse the schedule string (format: "2025-03-11 12:00")
    const [datePart, timePart] = schedule.split(" ");
    if (!datePart || !timePart) {
      console.error(`Invalid one-time schedule format: ${schedule}`);
      return false;
    }

    // Create Date object for the scheduled time
    const scheduledDate = new Date(`${datePart}T${timePart}:00+08:00`); // Taipei is UTC+8

    if (isNaN(scheduledDate.getTime())) {
      console.error(`Invalid date/time: ${schedule}`);
      return false;
    }

    // Get current time in Taipei timezone
    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Taipei" }),
    );

    // Normalize both dates to minute precision for comparison (remove seconds)
    const normalizedNow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      now.getMinutes(),
      0,
      0,
    );

    const normalizedScheduled = new Date(
      scheduledDate.getFullYear(),
      scheduledDate.getMonth(),
      scheduledDate.getDate(),
      scheduledDate.getHours(),
      scheduledDate.getMinutes(),
      0,
      0,
    );

    // The job should run if the scheduled time matches the current time
    console.log(`Scheduled time: ${normalizedScheduled}`);
    console.log(`Current time: ${normalizedNow}`);
    const shouldRun = normalizedNow.getTime() === normalizedScheduled.getTime();
    return shouldRun;
  } catch (error) {
    console.error(`Error parsing one-time schedule: ${schedule}`, error);
    return false;
  }
}
