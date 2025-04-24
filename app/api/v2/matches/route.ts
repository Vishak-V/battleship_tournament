const API_BASE = "http://localhost:8000/v2/matches";

export type Match = {
  id: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  bot1: {
    id: string;
    name: string;
    wins: number;
  };
  bot2: {
    id: string;
    name: string;
    wins: number;
  };
  winner?: {
    id: string;
    name: string;
  };
  game_logs?: any;
};

// Create a new match
export async function createMatch(bot1_id: string, bot2_id: string, rounds = 3): Promise<Match> {
  const res = await fetch(`${API_BASE}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // add auth header if needed: Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ bot1_id, bot2_id, rounds })
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return await res.json();
}

// List all matches
export async function listMatches(status?: string): Promise<Match[]> {
  const query = status ? `?status=${status}` : "";
  const res = await fetch(`${API_BASE}/${query}`, {
    headers: {
      // add auth header if needed
    }
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return await res.json();
}

// Get one match by ID
export async function getMatch(matchId: string): Promise<Match> {
  const res = await fetch(`${API_BASE}/${matchId}`);

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return await res.json();
}

// Create a rematch
export async function rematch(matchId: string): Promise<Match> {
  const res = await fetch(`${API_BASE}/${matchId}/rematch`, {
    method: "POST"
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return await res.json();
}
