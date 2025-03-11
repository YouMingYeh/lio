async function addMemory(
  data: string,
  userId: string,
  metadata?: Record<string, unknown>,
): Promise<unknown> {
  const payload = {
    data,
    user_id: userId,
    metadata,
  };

  try {
    const response = await fetch("https://api.adastra.tw/add-memory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function searchMemory(query: string, userId: string): Promise<unknown> {
  const payload = {
    query,
    user_id: userId,
  };

  try {
    const response = await fetch("https://api.adastra.tw/search-memory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function updateMemory(id: string, data: string): Promise<unknown> {
  const payload = {
    id,
    data,
  };

  try {
    const response = await fetch("https://api.adastra.tw/update-memory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getAllMemory(userId: string): Promise<unknown> {
  const payload = {
    user_id: userId,
  };

  try {
    const response = await fetch("https://api.adastra.tw/get-all-memory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export { addMemory, searchMemory, updateMemory, getAllMemory };
