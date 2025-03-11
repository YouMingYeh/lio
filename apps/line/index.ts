import { eventHandler } from "./event-handler/index.js";
import { middlewareConfig } from "@/client/messaging-api.js";
import {
  sendImageMessage,
  sendTextMessage,
} from "@/lib/message-sender/index.js";
import { webhook, HTTPFetchError, middleware } from "@line/bot-sdk";
import * as dotenv from "dotenv";
import express, { Application, Request, Response } from "express";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app: Application = express();

app.get("/", async (_: Request, res: Response): Promise<Response> => {
  return res.status(200).json({
    status: "success",
    message: "Connected successfully!",
  });
});

app.get("/health", async (_: Request, res: Response): Promise<Response> => {
  return res.status(200).json({
    status: "success",
    message: "Healthy!",
  });
});

app.post(
  "/send-text-message",
  express.json(),
  async (req: Request, res: Response): Promise<Response> => {
    const { to, message } = req.body;
    if (!to || !message) {
      return res.status(400).json({ status: "error" });
    }
    const sentMessages = await sendTextMessage(to, message);
    if (!sentMessages) {
      return res.status(500).json({ status: "error" });
    }
    return res.status(200).json({ status: "success", sentMessages });
  },
);

app.post(
  "/send-image-message",
  express.json(),
  async (req: Request, res: Response): Promise<Response> => {
    const { to, imageUrl, previewUrl } = req.body;
    if (!to || !imageUrl || !previewUrl) {
      return res.status(400).json({ status: "error" });
    }
    const sentMessages = await sendImageMessage(to, imageUrl, previewUrl);
    if (!sentMessages) {
      return res.status(500).json({ status: "error" });
    }
    return res.status(200).json({ status: "success", sentMessages });
  },
);

app.post(
  "/callback",
  middleware(middlewareConfig),
  async (req: Request, res: Response): Promise<Response> => {
    const callbackRequest: webhook.CallbackRequest = req.body;
    const events: webhook.Event[] = callbackRequest.events!;
    console.log("Events: ", events);
    if (!events) {
      return res.status(400).json({ status: "error" });
    }

    const results = await Promise.all(
      events.map(async (event: webhook.Event) => {
        try {
          await eventHandler(event);
        } catch (err: unknown) {
          if (err instanceof HTTPFetchError) {
            console.error(err.status);
            console.error(err.headers.get("x-line-request-id"));
            console.error(err.body);
          } else if (err instanceof Error) {
            console.error(err);
          }
          return res.status(500).json({ status: "error" });
        }
      }),
    );

    return res.status(200).json({ status: "success", results });
  },
);

// Create a server and listen to it.
app.listen(PORT, () => {
  console.log(
    `Application is live and listening on port ${PORT} at ${new Date()}.`,
  );
});
