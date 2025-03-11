async function getUploadUrl(filename: string) {
  const response = await fetch("https://lio.adastra.tw/api/pre-signed", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ filename }),
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.url;
}

async function uploadFile(url: string, file: File) {
  const response = await fetch(url, {
    method: "PUT",
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.statusText}`);
  }
}

async function getDownloadUrl(filename: string) {
  const response = await fetch(
    `https://lio.adastra.tw/api/pre-signed?filename=${filename}`,
  );

  if (!response.ok) {
    throw new Error(`Error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.url;
}

async function parseFile(url: string): Promise<string> {
  const response = await fetch("https://api.adastra.tw/parse", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });
  if (!response.ok) {
    return "";
  }
  return response.text();
}

async function getMimeTypeFromUrl(fileUrl: string): Promise<string> {
  const response = await fetch(fileUrl, { method: "HEAD" });
  const contentType = response.headers.get("content-type");
  return contentType || "application/octet-stream";
}

export {
  getUploadUrl,
  getDownloadUrl,
  uploadFile,
  parseFile,
  getMimeTypeFromUrl,
};
