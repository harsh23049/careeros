import * as api from "../services/api.js";

console.log("CareerOS background service worker loaded");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "CAREEROS_API_REQUEST") {
    return false;
  }

  const { action, payload } = message;

  (async () => {
    try {
      let result;
      switch (action) {
        case "saveJob":
          result = await api.saveJob(payload);
          break;
        case "getJob":
          result = await api.getJob(payload?.jobId);
          break;
        case "analyzeJob":
          result = await api.analyzeJob(payload?.jobId);
          break;
        case "getResumes":
          result = await api.getResumes();
          break;
        case "getDefaultResume":
          result = await api.getDefaultResume();
          break;
        case "matchResume":
          result = await api.matchResume(payload?.jobId, payload?.resumeId);
          break;
        case "generateCoverLetter":
          result = await api.generateCoverLetter(payload?.jobId, payload?.resumeId);
          break;
        case "createApplication":
          result = await api.createApplication(
            payload?.jobId,
            payload?.resumeId,
            payload?.coverLetterId,
            payload?.status,
            payload?.notes,
            payload?.source
          );
          break;
        case "getApplications":
          result = await api.getApplications(payload?.status);
          break;
        case "updateApplicationStatus":
          result = await api.updateApplicationStatus(
            payload?.id,
            payload?.status,
            payload?.notes
          );
          break;
        case "getUserProfile":
          result = await api.getUserProfile();
          break;
        case "getActiveAssistedApply": {
          const stored = await chrome.storage.local.get("activeAssistedApply");
          result = stored.activeAssistedApply || null;
          break;
        }
        case "setActiveAssistedApply": {
          await chrome.storage.local.set({ activeAssistedApply: payload });
          result = { success: true };
          break;
        }
        case "clearActiveAssistedApply": {
          await chrome.storage.local.remove("activeAssistedApply");
          result = { success: true };
          break;
        }
        case "login":
          result = await api.login(payload?.email, payload?.password);
          break;
        case "logout":
          result = await api.logout();
          break;
        case "getAuthStatus": {
          const tokens = await api.getTokens();
          result = {
            isAuthenticated: Boolean(tokens.accessToken || tokens.refreshToken),
          };
          break;
        }
        default:
          throw new Error(`Unknown API action: ${action}`);
      }

      sendResponse({ success: true, data: result });
    } catch (error) {
      console.error(`CareerOS background API error [${action}]:`, error);
      sendResponse({
        success: false,
        error: {
          message: error.message || "An unexpected error occurred.",
          status: error.status || 500,
        },
      });
    }
  })();

  return true; // Keep message channel open for async response
});