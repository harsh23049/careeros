const API_BASE_URL = "http://localhost:8000/api/v1";

let refreshPromise = null;

const createApiError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const getTokens = async () => {
  const result = await chrome.storage.local.get(["accessToken", "refreshToken"]);
  return {
    accessToken: result.accessToken || null,
    refreshToken: result.refreshToken || null,
  };
};

const getAccessToken = async () => {
  const result = await chrome.storage.local.get("accessToken");
  return result.accessToken || null;
};

const getRefreshToken = async () => {
  const result = await chrome.storage.local.get("refreshToken");
  return result.refreshToken || null;
};

const setTokens = async ({ accessToken, refreshToken }) => {
  const payload = {};
  if (accessToken !== undefined) payload.accessToken = accessToken;
  if (refreshToken !== undefined) payload.refreshToken = refreshToken;
  await chrome.storage.local.set(payload);
};

const clearTokens = async () => {
  await chrome.storage.local.remove(["accessToken", "refreshToken"]);
};

const refreshAccessToken = async () => {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    await clearTokens();
    throw createApiError(401, "Please log in to CareerOS.");
  }

  let response;
  let responseBody = {};

  try {
    response = await fetch(`${API_BASE_URL}/users/refresh-access-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    responseBody = await response.json().catch(() => ({}));
  } catch (error) {
    console.error("CareerOS token refresh failed (network error):", error);
    throw createApiError(0, "Unable to connect to CareerOS.");
  }

  if (!response.ok) {
    await clearTokens();
    throw createApiError(
      response.status,
      responseBody.message || "Please log in to CareerOS."
    );
  }

  const newAccessToken = responseBody?.data?.accessToken;
  if (!newAccessToken) {
    await clearTokens();
    throw createApiError(500, "Invalid refresh response from CareerOS.");
  }

  await chrome.storage.local.set({ accessToken: newAccessToken });
  return newAccessToken;
};

const requestTokenRefresh = () => {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

const authenticatedFetch = async (url, options = {}) => {
  let accessToken = await getAccessToken();

  if (!accessToken) {
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      accessToken = await requestTokenRefresh();
    } else {
      throw createApiError(401, "Please log in to CareerOS.");
    }
  }

  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${accessToken}`,
  };

  let response;
  let responseBody = {};

  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
    responseBody = await response.json().catch(() => ({}));
  } catch (error) {
    console.error("CareerOS API request failed:", error);
    throw createApiError(0, "Unable to connect to CareerOS.");
  }

  if (response.status === 401) {
    try {
      accessToken = await requestTokenRefresh();
    } catch (refreshError) {
      throw refreshError;
    }

    const retryHeaders = {
      ...(options.headers || {}),
      Authorization: `Bearer ${accessToken}`,
    };

    try {
      response = await fetch(url, {
        ...options,
        headers: retryHeaders,
      });
      responseBody = await response.json().catch(() => ({}));
    } catch (error) {
      console.error("CareerOS API retry request failed:", error);
      throw createApiError(0, "Unable to connect to CareerOS.");
    }

    if (response.status === 401) {
      await clearTokens();
      throw createApiError(401, "Please log in to CareerOS.");
    }
  }

  return { response, responseBody };
};

const login = async (email, password) => {
  if (!email?.trim() || !password?.trim()) {
    throw createApiError(400, "Email and password are required.");
  }

  let response;
  let responseBody = {};

  try {
    response = await fetch(`${API_BASE_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    responseBody = await response.json().catch(() => ({}));
  } catch (error) {
    console.error("CareerOS login request failed:", error);
    throw createApiError(0, "Unable to connect to CareerOS.");
  }

  if (!response.ok) {
    throw createApiError(
      response.status,
      responseBody.message || "Failed to log in to CareerOS."
    );
  }

  const { accessToken, refreshToken } = responseBody.data || {};
  if (accessToken && refreshToken) {
    await chrome.storage.local.set({ accessToken, refreshToken });
  }

  return responseBody.data || responseBody;
};

const saveJob = async (jobData) => {
  if (
    !jobData?.jobTitle?.trim() ||
    !jobData?.company?.trim() ||
    !jobData?.jobUrl?.trim()
  ) {
    throw createApiError(
      400,
      "Job title, company, and URL are required."
    );
  }

  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw createApiError(
      401,
      "Please log in to CareerOS."
    );
  }

  const jobPayload = {
    company: jobData.company,
    jobTitle: jobData.jobTitle,
    jobUrl: jobData.jobUrl,
    description: jobData.description,
    location: jobData.location,
  };

  let response;
  let responseBody = {};

  try {
    response = await fetch(
      `${API_BASE_URL}/jobs`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(jobPayload),
      }
    );

    responseBody = await response.json().catch(() => ({}));
  } catch (error) {
    console.error("CareerOS API request failed:", error);
    throw createApiError(
      0,
      "Unable to connect to CareerOS."
    );
  }

  if (!response.ok) {
    throw createApiError(
      response.status,
      responseBody.message || "CareerOS could not save the job."
    );
  }

  return responseBody;
};

const analyzeJob = async (jobId) => {
  if (!jobId?.trim()) {
    throw createApiError(
      400,
      "Job ID is required for analysis."
    );
  } 

  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw createApiError(
      401,
      "Please log in to CareerOS."
    );
  }

  let response;
  let responseBody = {};

  try {
    response = await fetch(
      `${API_BASE_URL}/jobs/${encodeURIComponent(jobId)}/analyze`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
      }
    );

    responseBody = await response.json().catch(() => ({}));
  } catch (error) {
    console.error("CareerOS analyze job request failed:", error);
    throw createApiError(
      0,
      "Unable to connect to CareerOS."
    );
  }

  if (!response.ok) {
    throw createApiError(
      response.status,
      responseBody.message || "CareerOS could not analyze the job."
    );
  }

  return responseBody.data || responseBody;
};


const getResumes = async () => {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw createApiError(401, "Please log in to CareerOS.");
  }

  let response;
  let responseBody = {};

  try {
    response = await fetch(`${API_BASE_URL}/resumes`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    responseBody = await response.json().catch(() => ({}));
  } catch (error) {
    console.error("CareerOS API request failed:", error);
    throw createApiError(0, "Unable to connect to CareerOS.");
  }

  if (!response.ok) {
    throw createApiError(
      response.status,
      responseBody.message || "CareerOS could not fetch resumes."
    );
  }

  return responseBody.data || responseBody;
};

const matchResume = async (jobId, resumeId) => {
  if (!jobId || !resumeId) {
    throw createApiError(400, "Job ID and Resume ID are required.");
  }

  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw createApiError(401, "Please log in to CareerOS.");
  }

  let response;
  let responseBody = {};

  try {
    response = await fetch(
      `${API_BASE_URL}/jobs/${encodeURIComponent(jobId)}/match-resume/${encodeURIComponent(resumeId)}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      }
    );

    responseBody = await response.json().catch(() => ({}));
  } catch (error) {
    console.error("CareerOS API request failed:", error);
    throw createApiError(0, "Unable to connect to CareerOS.");
  }

  if (!response.ok) {
    throw createApiError(
      response.status,
      responseBody.message || "CareerOS could not match the resume."
    );
  }

  return responseBody.data?.matchAnalysis || responseBody.matchAnalysis || responseBody;
};

const generateCoverLetter = async (jobId, resumeId) => {
  if (!jobId || !resumeId) {
    throw createApiError(400, "Job ID and Resume ID are required.");
  }

  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw createApiError(401, "Please log in to CareerOS.");
  }

  let response;
  let responseBody = {};

  try {
    response = await fetch(
      `${API_BASE_URL}/jobs/${encodeURIComponent(jobId)}/cover-letter/${encodeURIComponent(resumeId)}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      }
    );

    responseBody = await response.json().catch(() => ({}));
  } catch (error) {
    console.error("CareerOS API request failed:", error);
    throw createApiError(0, "Unable to connect to CareerOS.");
  }

  if (!response.ok) {
    throw createApiError(
      response.status,
      responseBody.message || "CareerOS could not generate cover letter."
    );
  }

  return responseBody.data?.coverLetter || responseBody.coverLetter || responseBody;
};

const createApplication = async (jobId, resumeId, coverLetterId) => {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw createApiError(401, "Please log in to CareerOS.");
  }

  let response;
  let responseBody = {};

  try {
    response = await fetch(`${API_BASE_URL}/applications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        job: jobId,
        resume: resumeId,
        coverLetter: coverLetterId,
        status: "saved"
      }),
    });

    responseBody = await response.json().catch(() => ({}));
  } catch (error) {
    console.error("CareerOS API request failed:", error);
    throw createApiError(0, "Unable to connect to CareerOS.");
  }

  if (!response.ok) {
    throw createApiError(
      response.status,
      responseBody.message || "CareerOS could not create application."
    );
  }

  return responseBody.data || responseBody;
};

export {
  saveJob,
  analyzeJob,
  getResumes,
  matchResume,
  generateCoverLetter,
  createApplication,
  login,
  getTokens,
  setTokens,
  clearTokens,
  refreshAccessToken,
  requestTokenRefresh,
};
