const API_URL = 'http://4.237.58.241:3000';

/**
 * Fetch that handles bearer token authorization
 * and automatic refresh on 401 responses.
 */
export async function fetchWithAuth(url, options = {}) {
  let bearerToken = localStorage.getItem('bearerToken');

  options.headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${bearerToken}`,
  };

  // Initial request
  let res = await fetch(url, options);

  // Attempt token refresh if unauthorised
  if (res.status === 401) {
    const refreshed = await tryRefreshToken();

    if (refreshed) {
      const newBearer = localStorage.getItem('bearerToken');
      options.headers['Authorization'] = `Bearer ${newBearer}`;
      res = await fetch(url, options);
    } else {
      await handleLogout();
      window.location.href = '/login';
      return new Response(null, { status: 401 });
    }
  }

  return res;
}

/**
 * Attempts to refresh the access token using a valid refresh token.
 * Returns true if new tokens were acquired and saved, false otherwise.
 */
async function tryRefreshToken() {
  const currentRefreshToken = localStorage.getItem('refreshToken');
  if (!currentRefreshToken) return false;

  try {
    const res = await fetch(`${API_URL}/user/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: currentRefreshToken }),
    });

    // Handle refresh failure
    if (!res.ok) {
      const errorData = await res.json();
      console.warn('Refresh failed:', errorData.message);
      return false;
    }

    const data = await res.json();
    console.log('Refresh response:', data); 

    const newBearer = data?.bearerToken?.token;
    const newRefresh = data?.refreshToken?.token;

    // Validate tokens in response
    if (!newBearer || !newRefresh) {
      console.error('Missing tokens in refresh response:', data);
      return false;
    }

    // Store new tokens
    localStorage.setItem('bearerToken', newBearer);
    localStorage.setItem('refreshToken', newRefresh);

    return true;
  } catch (err) {
    console.error('Refresh token error:', err);
    return false;
  }
}

/**
 * Clears tokens from local storage,
 * used during logout or token invalidation.
 */
export const handleLogout = async () => {
  const refreshToken = localStorage.getItem('refreshToken');

  try {
    await fetch(`${API_URL}/user/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
  } catch (err) {
    console.error('Logout error:', err);
  }

  localStorage.removeItem('bearerToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userEmail');

  return true;
};
