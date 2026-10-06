const FIVE_MINUTES = 5 * 60 * 1000;

export function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  // Check if session has expired (5 minutes of inactivity)
  const lastActivity = localStorage.getItem('session_last_activity');
  const now = Date.now();

  if (lastActivity && now - parseInt(lastActivity) > FIVE_MINUTES) {
    // Session expired, clear it
    clearSession();
  }

  let id = localStorage.getItem('session_id');
  if (!id) {
    id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('session_id', id);
  }

  // Update last activity timestamp
  localStorage.setItem('session_last_activity', now.toString());

  return id;
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('session_id');
  localStorage.removeItem('session_last_activity');
}

export function updateSessionActivity(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('session_last_activity', Date.now().toString());
}
