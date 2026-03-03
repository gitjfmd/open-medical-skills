/**
 * GitHub OAuth authentication helpers for client-side auth flow.
 *
 * Flow:
 * 1. User clicks "Sign in with GitHub" -> redirect to GitHub authorize URL
 * 2. GitHub redirects back to /auth/callback with ?code=...
 * 3. Callback page sends code to our Worker API to exchange for access token
 * 4. Token + user info stored in localStorage
 * 5. Subsequent requests use the stored token
 *
 * The client secret never touches the browser — the Worker handles the
 * code-to-token exchange server-side.
 */

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/**
 * GitHub OAuth App Client ID.
 * Set this to your actual Client ID, or read from an env-injected global.
 * For Astro static builds, this is baked in at build time.
 */
const GITHUB_CLIENT_ID = import.meta.env.PUBLIC_GITHUB_CLIENT_ID || "GITHUB_CLIENT_ID";

/**
 * Base URL of the Cloudflare Worker API that handles token exchange.
 */
const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL || "https://api.openmedicalskills.org";

/**
 * OAuth callback URL — must match the one registered in the GitHub OAuth App.
 */
const REDIRECT_URI = import.meta.env.PUBLIC_OAUTH_REDIRECT_URI || "https://openmedicalskills.org/auth/callback";

// ---------------------------------------------------------------------------
// localStorage keys
// ---------------------------------------------------------------------------

const STORAGE_KEY_TOKEN = "oms_github_token";
const STORAGE_KEY_USER = "oms_github_user";
const STORAGE_KEY_RETURN_URL = "oms_auth_return_url";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  html_url: string;
}

// ---------------------------------------------------------------------------
// Auth URL
// ---------------------------------------------------------------------------

/**
 * Constructs the GitHub OAuth authorize URL and saves the current page
 * as the return URL so we can redirect back after auth.
 */
export function getAuthUrl(): string {
  // Save current page so callback can redirect back
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_RETURN_URL, window.location.href);
  }

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: "read:user",
    state: generateState(),
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

/**
 * Generate a random state parameter to prevent CSRF attacks.
 */
function generateState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const state = Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");

  // Store state so we can verify it on callback
  if (typeof window !== "undefined") {
    sessionStorage.setItem("oms_oauth_state", state);
  }

  return state;
}

/**
 * Verify the state parameter returned from GitHub matches what we sent.
 */
export function verifyState(state: string): boolean {
  if (typeof window === "undefined") return false;
  const stored = sessionStorage.getItem("oms_oauth_state");
  sessionStorage.removeItem("oms_oauth_state");
  return stored === state;
}

// ---------------------------------------------------------------------------
// Token exchange
// ---------------------------------------------------------------------------

/**
 * Exchange the authorization code for an access token via our Worker API.
 * The Worker calls GitHub's token endpoint with the client secret so the
 * secret is never exposed to the browser.
 */
export async function exchangeCode(code: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/auth/github/callback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as Record<string, string>).error || "Failed to exchange authorization code");
  }

  const data = (await response.json()) as { access_token: string };

  if (!data.access_token) {
    throw new Error("No access token received");
  }

  return data.access_token;
}

// ---------------------------------------------------------------------------
// User info
// ---------------------------------------------------------------------------

/**
 * Fetch the authenticated user's profile from the GitHub API.
 */
export async function fetchUser(token: string): Promise<GitHubUser> {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user info from GitHub");
  }

  const data = (await response.json()) as GitHubUser;
  return {
    login: data.login,
    id: data.id,
    avatar_url: data.avatar_url,
    name: data.name,
    html_url: data.html_url,
  };
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

/**
 * Save auth credentials to localStorage.
 */
export function saveAuth(token: string, user: GitHubUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_TOKEN, token);
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
}

/**
 * Get the stored access token, or null if not logged in.
 */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY_TOKEN);
}

/**
 * Get the stored user info, or null if not logged in.
 */
export function getUser(): GitHubUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY_USER);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as GitHubUser;
  } catch {
    return null;
  }
}

/**
 * Check whether the user is currently logged in (has a stored token).
 */
export function isLoggedIn(): boolean {
  return getToken() !== null;
}

/**
 * Clear all auth data from localStorage.
 */
export function logout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY_TOKEN);
  localStorage.removeItem(STORAGE_KEY_USER);
  localStorage.removeItem(STORAGE_KEY_RETURN_URL);
}

/**
 * Get and clear the return URL (the page the user was on before auth).
 */
export function getReturnUrl(): string {
  if (typeof window === "undefined") return "/";
  const url = localStorage.getItem(STORAGE_KEY_RETURN_URL);
  localStorage.removeItem(STORAGE_KEY_RETURN_URL);
  return url || "/";
}
