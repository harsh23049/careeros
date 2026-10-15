import {
    saveJob,
    analyzeJob,
    getResumes,
    matchResume,
    generateCoverLetter,
    createApplication,
    login,
    logout,
    getUserProfile,
    getTokens,
} from "../services/api.js";

// DOM Elements: Auth
const initialLoading = document.getElementById("initialLoading");
const authSection = document.getElementById("authSection");
const authError = document.getElementById("authError");
const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const togglePasswordBtn = document.getElementById("togglePasswordBtn");
const togglePasswordIcon = document.getElementById("togglePasswordIcon");
const loginSubmitBtn = document.getElementById("loginSubmitBtn");

// DOM Elements: Account
const mainSection = document.getElementById("mainSection");
const userAvatar = document.getElementById("userAvatar");
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");

// DOM Elements: Job Tools
const status = document.getElementById("status");
const jobTitle = document.getElementById("jobTitle");
const company = document.getElementById("company");
const location = document.getElementById("location");
const description = document.getElementById("description");
const jobUrl = document.getElementById("jobUrl");
const saveJobButton = document.getElementById("saveJob");
const analyzeJobButton = document.getElementById("analyzeJob");
const analysisContainer = document.getElementById("analysis");
const resumeSection = document.getElementById("resumeSection");
const resumeSelect = document.getElementById("resumeSelect");
const matchResumeButton = document.getElementById("matchResume");
const generateCoverLetterButton = document.getElementById("generateCoverLetter");
const matchResultContainer = document.getElementById("matchResult");
const coverLetterResultContainer = document.getElementById("coverLetterResult");

let currentJob = null;
let currentCoverLetterId = null;

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

// =====================================================
// AUTH & VIEW SWITCHING
// =====================================================

function showAuthView(errorMessage = "") {
    initialLoading.style.display = "none";
    mainSection.style.display = "none";
    authSection.style.display = "block";

    loginSubmitBtn.disabled = false;
    loginSubmitBtn.textContent = "Log In";

    if (errorMessage) {
        authError.textContent = errorMessage;
        authError.style.display = "block";
    } else {
        authError.textContent = "";
        authError.style.display = "none";
    }
}

function showMainView(user) {
    initialLoading.style.display = "none";
    authSection.style.display = "none";
    mainSection.style.display = "block";

    const displayName = user?.fullName || user?.username || "CareerOS User";
    userName.textContent = displayName;
    userEmail.textContent = user?.email || "";
    userAvatar.textContent = (displayName[0] || "U").toUpperCase();
    logoutBtn.disabled = false;
    logoutBtn.textContent = "Log Out";
}

function showAuthError(message) {
    authError.textContent = message;
    authError.style.display = "block";
}

// Toggle password visibility
togglePasswordBtn?.addEventListener("click", () => {
    if (loginPassword.type === "password") {
        loginPassword.type = "text";
        togglePasswordIcon.textContent = "🙈";
    } else {
        loginPassword.type = "password";
        togglePasswordIcon.textContent = "👁";
    }
});

// Login form submission
loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();

    if (!email || !password) {
        showAuthError("Email and password are required.");
        return;
    }

    loginSubmitBtn.disabled = true;
    loginSubmitBtn.textContent = "Logging in...";
    authError.style.display = "none";

    try {
        await login(email, password);
        const profile = await getUserProfile();
        showMainView(profile);
        await loadJob();
    } catch (error) {
        console.error("CareerOS popup login error:", error);
        loginSubmitBtn.disabled = false;
        loginSubmitBtn.textContent = "Log In";

        if (error.status === 401 || error.status === 400) {
            showAuthError("Invalid email or password.");
        } else if (error.status === 0) {
            showAuthError("Unable to connect to CareerOS server.");
        } else {
            showAuthError(error.message || "Login failed. Please try again.");
        }
    }
});

// Logout action
logoutBtn?.addEventListener("click", async () => {
    logoutBtn.disabled = true;
    logoutBtn.textContent = "Logging out...";

    try {
        await logout();
    } catch (error) {
        console.error("CareerOS logout error:", error);
    } finally {
        loginPassword.value = "";
        showAuthView();
    }
});

// Check existing session
async function checkSession() {
    try {
        const tokens = await getTokens();

        if (!tokens.accessToken && !tokens.refreshToken) {
            showAuthView();
            return;
        }

        const profile = await getUserProfile();
        showMainView(profile);
        await loadJob();
    } catch (error) {
        console.error("CareerOS session verification error:", error);

        if (error.status === 401 || error.status === 403) {
            showAuthView("Your session has expired. Please log in again.");
        } else {
            // Network failure or temporary server issue — do not logout
            showMainView({ fullName: "CareerOS User", email: "" });
            status.textContent = error.status === 0
                ? "Offline / Unable to connect to server."
                : "Unable to verify profile with server.";
            await loadJob();
        }
    }
}

// =====================================================
// JOB DATA & PAGE INTERACTIONS
// =====================================================

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
        console.error("CareerOS load job error:", error);
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
        const response = await saveJob(currentJob);
        const savedJob = response?.data || response;
        if (savedJob?._id) {
            currentJob._id = savedJob._id;
        }
        status.textContent = "Job saved successfully.";
    } catch (error) {
        console.error("CareerOS save job failed:", error);

        if (error.status === 401 || error.status === 403) {
            status.textContent = "Your session has expired. Please log in again.";
            showAuthView("Your session has expired. Please log in again.");
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
        
        await loadResumes();
    } catch (error) {
        console.error("CareerOS analyze job failed:", error);

        if (error.status === 401 || error.status === 403) {
            status.textContent = "Your session has expired. Please log in again.";
            showAuthView("Your session has expired. Please log in again.");
        } else {
            status.textContent =
                "Unable to analyze this job. Please try again.";
        }
    } finally {
        saveJobButton.disabled = !hasValidJobData(currentJob);
        analyzeJobButton.disabled = !hasValidJobData(currentJob);
    }
}

async function loadResumes() {
    try {
        const resumes = await getResumes();
        const resumeList = Array.isArray(resumes) ? resumes : (resumes?.data || []);
        
        resumeSelect.innerHTML = "";
        
        if (!resumeList || resumeList.length === 0) {
            resumeSelect.innerHTML = "<option value=''>No resumes found</option>";
            matchResumeButton.disabled = true;
            generateCoverLetterButton.disabled = true;
            resumeSection.style.display = "flex";
            return;
        }

        resumeList.forEach(resume => {
            const option = document.createElement("option");
            option.value = resume._id;
            option.textContent = resume.title + (resume.isDefault ? " (Default)" : "");
            resumeSelect.appendChild(option);
            
            if (resume.isDefault) {
                option.selected = true;
            }
        });

        resumeSection.style.display = "flex";
        matchResumeButton.disabled = false;
        generateCoverLetterButton.disabled = false;
    } catch (error) {
        console.error("Failed to load resumes:", error);
        if (error.status === 401 || error.status === 403) {
            status.textContent = "Your session has expired. Please log in again.";
            showAuthView("Your session has expired. Please log in again.");
        } else {
            resumeSelect.innerHTML = "<option value=''>Error loading resumes</option>";
        }
    }
}

function renderMatchResult(matchAnalysis) {
    matchResultContainer.innerHTML = "";
    matchResultContainer.style.display = "block";
    coverLetterResultContainer.style.display = "none";

    const scoreDiv = document.createElement("div");
    scoreDiv.className = "match-score";
    scoreDiv.textContent = `${matchAnalysis.matchScore || 0}% Match`;
    matchResultContainer.appendChild(scoreDiv);

    const renderList = (title, items, className = "") => {
        if (!items || items.length === 0) return;
        const h4 = document.createElement("h4");
        h4.textContent = title;
        const ul = document.createElement("ul");
        if (className) ul.className = className;
        items.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item;
            ul.appendChild(li);
        });
        matchResultContainer.appendChild(h4);
        matchResultContainer.appendChild(ul);
    };

    renderList("Matching Skills", matchAnalysis.matchingSkills, "skills-matching");
    renderList("Missing Skills", matchAnalysis.missingSkills, "skills-missing");
    renderList("Strengths", matchAnalysis.strengths);
    renderList("Weaknesses", matchAnalysis.weaknesses);
    renderList("Recommendations", matchAnalysis.recommendations);
}

async function handleMatchResume() {
    const resumeId = resumeSelect.value;
    if (!resumeId) return;

    if (!currentJob?._id) {
        status.textContent = "Please analyze the job first.";
        return;
    }

    matchResumeButton.disabled = true;
    generateCoverLetterButton.disabled = true;
    status.textContent = "Matching resume...";
    matchResultContainer.style.display = "none";
    coverLetterResultContainer.style.display = "none";

    try {
        const result = await matchResume(currentJob._id, resumeId);
        renderMatchResult(result);
        status.textContent = "Match complete.";
    } catch (error) {
        console.error("Match failed:", error);
        if (error.status === 400) {
            status.textContent = "Please analyze the job first.";
        } else if (error.status === 401 || error.status === 403) {
            status.textContent = "Your session has expired. Please log in again.";
            showAuthView("Your session has expired. Please log in again.");
        } else {
            status.textContent = error.message || "Failed to match resume.";
        }
    } finally {
        matchResumeButton.disabled = false;
        generateCoverLetterButton.disabled = false;
    }
}

async function handleGenerateCoverLetter() {
    const resumeId = resumeSelect.value;
    if (!resumeId) return;

    if (!currentJob?._id) {
        status.textContent = "Please analyze or save the job first.";
        return;
    }

    matchResumeButton.disabled = true;
    generateCoverLetterButton.disabled = true;
    status.textContent = "Generating cover letter...";
    matchResultContainer.style.display = "none";
    coverLetterResultContainer.style.display = "none";

    try {
        const result = await generateCoverLetter(currentJob._id, resumeId);
        currentCoverLetterId = result._id;
        
        coverLetterResultContainer.innerHTML = "";
        coverLetterResultContainer.style.display = "block";

        const textarea = document.createElement("textarea");
        textarea.className = "cover-letter-text";
        textarea.value = result.content || (typeof result === "string" ? result : "");
        coverLetterResultContainer.appendChild(textarea);

        const actionsDiv = document.createElement("div");
        actionsDiv.className = "actions";
        
        const copyBtn = document.createElement("button");
        copyBtn.textContent = "Copy to Clipboard";
        copyBtn.className = "btn-secondary";
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(textarea.value);
            copyBtn.textContent = "Copied!";
            setTimeout(() => { copyBtn.textContent = "Copy to Clipboard"; }, 2000);
        };
        actionsDiv.appendChild(copyBtn);

        const applyBtn = document.createElement("button");
        applyBtn.textContent = "Add to Applications";
        applyBtn.onclick = async () => {
            try {
                applyBtn.disabled = true;
                applyBtn.textContent = "Saving...";
                await createApplication(currentJob._id, resumeId, currentCoverLetterId);
                applyBtn.textContent = "Application saved!";
                status.textContent = "Added to applications.";
            } catch (err) {
                console.error("Failed to create application", err);
                applyBtn.textContent = "Failed to save";
                applyBtn.disabled = false;
                if (err.status === 401 || err.status === 403) {
                    showAuthView("Your session has expired. Please log in again.");
                }
            }
        };
        actionsDiv.appendChild(applyBtn);

        coverLetterResultContainer.appendChild(actionsDiv);
        
        status.textContent = "Cover letter generated.";
    } catch (error) {
        console.error("Cover letter generation failed:", error);
        if (error.status === 401 || error.status === 403) {
            status.textContent = "Your session has expired. Please log in again.";
            showAuthView("Your session has expired. Please log in again.");
        } else {
            status.textContent = error.message || "Failed to generate cover letter.";
        }
    } finally {
        matchResumeButton.disabled = false;
        generateCoverLetterButton.disabled = false;
    }
}

// Attach event listeners
saveJobButton?.addEventListener("click", handleSaveJob);
analyzeJobButton?.addEventListener("click", handleAnalyzeJob);
matchResumeButton?.addEventListener("click", handleMatchResume);
generateCoverLetterButton?.addEventListener("click", handleGenerateCoverLetter);

// Start by checking authentication state
checkSession();