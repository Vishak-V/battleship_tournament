const API_BASE = "http://localhost:8000/v2";

// 1. UserProfile
export type UserProfile = {
  id: string;
  email: string;
  name: string | null;
  oauth_provider: string | null;
  created_at: string; // ISO date string
  last_login: string; // ISO date string
  stats?: {
    bot_count: number;
    tournament_count: number;
    match_count: number;
  };
};

// 2. UserStats
export type UserStats = {
  tournaments: {
    total: number;
    completed: number;
    running: number;
    pending: number;
  };
  matches: {
    total: number;
    completed: number;
  };
  bots: {
    total: number;
    win_rate: number;
    total_matches_participated: number;
    total_wins: number;
  };
};

// 3. RecentActivity
export type RecentActivity =
  | {
      type: "bot_upload";
      timestamp: string;
      details: {
        bot_id: string;
        bot_name: string;
        description: string | null;
      };
    }
  | {
      type: "tournament_created";
      timestamp: string;
      details: {
        tournament_id: string;
        tournament_name: string;
        status: string;
      };
    }
  | {
      type: "match_created";
      timestamp: string;
      details: {
        match_id: string;
        status: string;
        bot1_id: string;
        bot2_id: string;
        winner_id: string | null;
      };
    };

// Create a new user profile
export async function createUserProfile(): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // add auth header if needed: Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return await res.json();
}

// Get the current user's profile
export async function getCurrentUserProfile(): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/me`);

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return await res.json();
}

// Update the current user's profile
export async function updateUserProfile(name?: string): Promise<UserProfile> {
  const query = name ? `?name=${encodeURIComponent(name)}` : "";
  const res = await fetch(`${API_BASE}/me${query}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      // add auth header if needed: Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return await res.json();
}

// Get the current user's stats
export async function getUserStats(): Promise<UserStats> {
  const res = await fetch(`${API_BASE}/me/stats`);

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return await res.json();
}

// Get the current user's recent activity
export async function getRecentActivity(limit = 10): Promise<RecentActivity[]> {
  const query = `?limit=${limit}`;
  const res = await fetch(`${API_BASE}/me/recent-activity${query}`);

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return await res.json();
}