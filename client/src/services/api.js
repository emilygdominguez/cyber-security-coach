const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch (error) {
    throw new Error(
      "Unable to reach the safety coach API. Make sure the Flask backend is running, then try again."
    );
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "Something went wrong while contacting the coach.");
  }

  return response.json();
}

export function analyzeContent(payload) {
  return request("/analyze", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchHistory() {
  return request("/history");
}

export function fetchStats() {
  return request("/stats");
}

export function fetchConfig() {
  return request("/config");
}
