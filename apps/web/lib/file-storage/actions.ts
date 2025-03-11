import { v4 } from "uuid";

/**
 * Fetches a presigned URL for uploading from your backend and then uploads the file
 * to that URL.
 *
 * @param {File} file - The file to be uploaded.
 * @param {string} uniqueFilename - The unique name to use for the uploaded file.
 * @returns {Promise<string | null>} The URL of the uploaded resource, or `null` if it fails.
 *
 * @example
 * ```ts
 * const url = await handlePreSignedUrlSubmit(file, "avatar_123.png");
 * // if url is not null, then the file is successfully uploaded to `url`.
 * ```
 */
const handlePreSignedUrlSubmit = async (file: File, uniqueFilename: string) => {
  if (file) {
    try {
      const res = await fetch("/api/pre-signed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filename: uniqueFilename }),
      });

      if (res.ok) {
        const { url }: { url: string } = await res.json();
        const uploadRes = await fetch(url, {
          method: "PUT",
          body: file,
        });

        if (uploadRes.ok) {
          return url;
        } else {
          console.error("Error uploading file:", uploadRes.statusText);
          return null;
        }
      } else {
        console.error("Error fetching presigned URL:", res.statusText);
        return null;
      }
    } catch (error) {
      console.error("Error in handlePreSignedUrlSubmit:", error);
      return null;
    }
  } else {
    console.error("No file provided for upload.");
    return null;
  }
};

/**
 * Orchestrates file upload by generating a unique filename, fetching the presigned URL,
 * uploading the file, and returning a public URL (or a fallback if something fails).
 *
 * @param {File} file - The file to be uploaded.
 * @returns {Promise<string>} The final accessible URL of the uploaded file or a fallback.
 *
 * @example
 * ```ts
 * const uploadedUrl = await uploadFile(file);
 * // => "https://r2.adastra.tw/some-unique-filename.png"
 * ```
 */
export async function uploadFile(file: File): Promise<string> {
  const uniqueFilename = `${file.name}_${v4()}`;
  const uploadUrl = await handlePreSignedUrlSubmit(file, uniqueFilename);

  if (uploadUrl) {
    return `https://r2.adastra.tw/${uniqueFilename}`;
  } else {
    console.error("File upload failed.");
    return "https://r2.adastra.tw/not-found.png";
  }
}
