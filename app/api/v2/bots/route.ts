const API_BASE = "http://localhost:8000/v2";

export type Bot = {
  id: string;
  name: string;
  filename: string;
  created_at: string;
};

// List all bots uploaded by the current user
export async function listBots(): Promise<Bot[]> {
  const res = await fetch(`${API_BASE}/bots`);

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return await res.json();
}

// Upload a new bot file
export async function uploadBot(file: File, name: string): Promise<Bot> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("name", name);

  const res = await fetch(`${API_BASE}/bots`, {
    method: "POST",
    body: formData
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return await res.json();
}

// Get details for a specific bot
export async function getBot(botId: string): Promise<Bot> {
  const res = await fetch(`${API_BASE}/bots/${botId}`);

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return await res.json();
}

// Soft delete a bot (mark as inactive)
export async function deleteBot(botId: string): Promise<Bot> {
  const res = await fetch(`${API_BASE}/bots/${botId}`, {
    method: "DELETE"
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return await res.json();
}