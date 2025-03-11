import { createJob, updateJobById } from "@/repositories/job-repository.js";
import { pushMessages } from "@/services/messaging-service.js";
import { CronJob, Job, JobParameters, OneTimeJob } from "@/types.js";

export async function runCronJob(job: CronJob) {
  const { data, error } = await runJob(job);
  if (error) {
    console.error("Failed to run job:", error.message);
    await updateJobById(job.id, { status: "failed" });
    await createJob({
      ...job,
      id: undefined,
      status: "pending",
    });
    return;
  }
  if (data) {
    await updateJobById(job.id, { status: "completed" });
    // Duplicate the job if it's a recurring job
    await createJob({
      ...job,
      id: undefined,
      status: "pending",
    });
  }
}

export async function runOneTimeJob(job: OneTimeJob) {
  const { data, error } = await runJob(job);
  if (error) {
    console.error("Failed to run job:", error.message);
    return;
  }
  if (data) {
    await updateJobById(job.id, { status: "completed" });
  }
}

export async function runJob(job: Job) {
  const parameters = job.parameters as JobParameters;
  switch (parameters.type) {
    case "push-message":
      return await pushMessages(parameters);
    default:
      console.error(`Unknown job parameters type: ${parameters.type}`);
      return { data: null, error: new Error("Unknown job parameters type") };
  }
}
