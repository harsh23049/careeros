import { saveJob } from "../services/api.js";

const status = document.getElementById("status");
const jobTitle = document.getElementById("jobTitle");
const company = document.getElementById("company");
const location = document.getElementById("location");
const description = document.getElementById("description");
const jobUrl = document.getElementById("jobUrl");
const saveJobButton = document.getElementById("saveJob");

let currentJob = null;

const recognizedPageTypes = [
    "linkedin_job",
    "naukri_job",
    "greenhouse_job",
    "workday_job",
    "google_form",
    "unknown"
];

const jobPageTypes = [
    "linkedin_job",
    "naukri_job",
    "greenhouse_job",
    "workday_job"
];

const restrictedPagePrefixes = [
    "chrome://",
    "chrome-extension://",
    "edge://",
    "about:",
    "view-source:"
];

function isRestrictedPage(url = "") {
    return restrictedPagePrefixes.some((prefix) =>
        url.startsWith(prefix)
    ) || url.includes("chrome.google.com/webstore")
        || url.includes("chromewebstore.google.com");
}

function hasValidJobData(job) {
    return Boolean(
        job &&
        jobPageTypes.includes(job.pageType) &&
        job.jobTitle?.trim() &&
        job.company?.trim() &&
        job.jobUrl?.trim()
    );
}

function sendPageData(tabId) {
    return new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(
            tabId,
            {
                type: "GET_PAGE_DATA",
            },
            (response) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                    return;
                }

                resolve(response);
            }
        );
    });
}

function injectContentScript(tabId) {
    return new Promise((resolve, reject) => {
        chrome.scripting.executeScript(
            {
                target: { tabId },
                files: ["content/content.js"]
            },
            () => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                    return;
                }

                resolve();
            }
        );
    });
}

async function requestPageData(tabId) {
    try {
        return await sendPageData(tabId);
    } catch {
        await injectContentScript(tabId);
        return sendPageData(tabId);
    }
}

async function loadJob() {

    try {

        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true,
        });

        if (!tab?.id || !tab.url) {
            status.textContent = "No active tab found.";
            return;
        }

        if (isRestrictedPage(tab.url)) {
            status.textContent =
                "This page cannot be accessed by CareerOS.";
            return;
        }

        const response = await requestPageData(tab.id);

        if (!response?.success) {
            status.textContent =
                response?.error || "Could not extract job.";
            return;
        }

        currentJob = response.data;

        if (!recognizedPageTypes.includes(currentJob.pageType)) {
            status.textContent = "Could not identify this page.";
            return;
        }

        jobTitle.textContent =
            currentJob.jobTitle || "Not found";

        company.textContent =
            currentJob.company || "Not found";

        location.textContent =
            currentJob.location || "Not found";

        description.textContent =
            currentJob.description || "Not found";

        jobUrl.textContent =
            currentJob.jobUrl || "Not found";

        saveJobButton.disabled = !hasValidJobData(currentJob);

        status.textContent = jobPageTypes.includes(
            currentJob.pageType
        ) ? "Job detected." : "No job detected.";

    } catch (error) {

        console.error(error);

        status.textContent =
            "This page cannot be accessed by CareerOS.";
    }
}

async function handleSaveJob() {
    if (!hasValidJobData(currentJob)) {
        status.textContent = "No valid job detected.";
        return;
    }

    saveJobButton.disabled = true;
    status.textContent = "Saving...";

    try {
        await saveJob(currentJob);
        status.textContent = "Job saved successfully.";
    } catch (error) {
        console.error("CareerOS save job failed:", error);

        if (error.status === 401 || error.status === 403) {
            status.textContent = "Please log in to CareerOS.";
        } else if (error.status === 409) {
            status.textContent = "Job already saved.";
        } else {
            status.textContent =
                "Unable to save job. Please try again.";
        }
    } finally {
        saveJobButton.disabled = false;
    }
}

saveJobButton.addEventListener("click", handleSaveJob);

loadJob(); 