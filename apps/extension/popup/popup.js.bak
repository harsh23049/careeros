import { saveJob, analyzeJob } from "../services/api.js";

const status = document.getElementById("status");
const jobTitle = document.getElementById("jobTitle");
const company = document.getElementById("company");
const location = document.getElementById("location");
const description = document.getElementById("description");
const jobUrl = document.getElementById("jobUrl");
const saveJobButton = document.getElementById("saveJob");
const analyzeJobButton = document.getElementById("analyzeJob");
const analysisContainer = document.getElementById("analysis");

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

function renderAnalysis(analysis) {
    analysisContainer.innerHTML = "";

    if (!analysis || typeof analysis !== "object") {
        analysisContainer.innerHTML = "<p>No analysis available.</p>";
        return;
    }

    const fieldTitles = {
        skills: "Skills",
        requirements: "Requirements",
        responsibilities: "Responsibilities",
        technologies: "Technologies",
        domains: "Domains",
    };

    if (analysis.summary?.trim()) {
        const summarySection = document.createElement("div");
        summarySection.className = "analysis-section";

        const summaryHeading = document.createElement("h3");
        summaryHeading.textContent = "Summary";
        const summaryText = document.createElement("p");
        summaryText.textContent = analysis.summary;

        summarySection.appendChild(summaryHeading);
        summarySection.appendChild(summaryText);
        analysisContainer.appendChild(summarySection);
    }

    Object.entries(fieldTitles).forEach(([field, title]) => {
        const items = Array.isArray(analysis[field])
            ? analysis[field].filter((item) => item && String(item).trim())
            : [];

        if (!items.length) {
            return;
        }

        const section = document.createElement("div");
        section.className = "analysis-section";

        const heading = document.createElement("h3");
        heading.textContent = title;

        const list = document.createElement("ul");

        items.forEach((item) => {
            const listItem = document.createElement("li");
            listItem.textContent = item;
            list.appendChild(listItem);
        });

        section.appendChild(heading);
        section.appendChild(list);
        analysisContainer.appendChild(section);
    });

    if (analysisContainer.children.length === 0) {
        analysisContainer.innerHTML = "<p>No analysis details returned.</p>";
    }
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

        analysisContainer.innerHTML = "";
        saveJobButton.disabled = !hasValidJobData(currentJob);
        analyzeJobButton.disabled = !hasValidJobData(currentJob);

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

async function handleAnalyzeJob() {
    if (!hasValidJobData(currentJob)) {
        status.textContent = "No valid job detected.";
        return;
    }

    saveJobButton.disabled = true;
    analyzeJobButton.disabled = true;
    analysisContainer.innerHTML = "";
    status.textContent = "Analyzing...";

    try {
        let jobId = currentJob?._id;

        if (!jobId) {
            const savedJobResponse = await saveJob(currentJob);
            const savedJob = savedJobResponse?.data || savedJobResponse;
            jobId = savedJob?._id;

            if (!jobId) {
                throw new Error("CareerOS did not return a job ID.");
            }

            currentJob._id = jobId;
        }

        const analysisResponse = await analyzeJob(jobId);
        const analysis = analysisResponse?.analysis || analysisResponse;

        renderAnalysis(analysis);
        status.textContent = "Job analysis ready.";
    } catch (error) {
        console.error("CareerOS analyze job failed:", error);

        if (error.status === 401 || error.status === 403) {
            status.textContent = "Please log in to CareerOS.";
        } else {
            status.textContent =
                "Unable to analyze this job. Please try again.";
        }
    } finally {
        saveJobButton.disabled = !hasValidJobData(currentJob);
        analyzeJobButton.disabled = !hasValidJobData(currentJob);
    }
}

saveJobButton.addEventListener("click", handleSaveJob);
analyzeJobButton.addEventListener("click", handleAnalyzeJob);

loadJob(); 