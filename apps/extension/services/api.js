const API_BASE_URL = "http://localhost:8000/api/v1";

const getAccessToken = async () => {
  const result = await chrome.storage.local.get("accessToken");
  return result.accessToken;
};

const createApiError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
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

export { saveJob, analyzeJob };
 