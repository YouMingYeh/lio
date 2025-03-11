type SendTextMessagePayload = {
  to: string;
  message: string;
};

export async function sendTextMessage(payload: SendTextMessagePayload) {
  const url = "https://lio-line.adastra.tw/send-text-message";

  console.log(payload);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    console.error("Failed to send text message:", response);
    return {
      data: null,
      error: new Error(`Error: ${response.status} ${response.statusText}`),
    };
  }

  const result = (await response.json()) as {
    sentMessages: { id: string }[];
  };
  return { data: result.sentMessages, error: null };
}

type sendImageMessagePayload = {
  to: string;
  imageUrl: string;
  previewUrl: string;
};

export async function sendImageMessage(payload: sendImageMessagePayload) {
  const url = "https://lio-line.adastra.tw/send-text-message";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    // throw new Error(`Error: ${response.status} ${response.statusText}`);
    return {
      data: null,
      error: new Error(`Error: ${response.status} ${response.statusText}`),
    };
  }

  const result = (await response.json()) as {
    sentMessages: { id: string }[];
  };
  return { data: result.sentMessages, error: null };
}
