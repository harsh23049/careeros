if (!globalThis.__careerOSContentScriptLoaded) {
    globalThis.__careerOSContentScriptLoaded = true;

    console.log("CareerOS content script loaded");


// =====================================================
// EXTRACTION HELPERS
// =====================================================

const MAX_DESCRIPTION_LENGTH = 5000;

function cleanText(value) {
    return (value || "")
        .replace(/\s+/g, " ")
        .trim();
}

function getElementText(selector) {
    const element = document.querySelector(selector);
    return cleanText(element?.innerText || element?.textContent);
}

function getMetaContent(selector) {
    return cleanText(document.querySelector(selector)?.getAttribute("content"));
}

function firstText(selectors) {
    for (const selector of selectors) {
        const value = selector.startsWith("meta[")
            ? getMetaContent(selector)
            : getElementText(selector);

        if (value) {
            return value;
        }
    }

    return "";
}

function getDescription(selectors) {
    const description = firstText(selectors);

    if (description) {
        return description.slice(0, MAX_DESCRIPTION_LENGTH);
    }

    const mainText = cleanText(document.querySelector("main")?.innerText);

    if (mainText) {
        return mainText.slice(0, MAX_DESCRIPTION_LENGTH);
    }

    return cleanText(document.body?.innerText)
        .slice(0, MAX_DESCRIPTION_LENGTH);
}

// =====================================================
// PAGE TYPE DETECTION
// =====================================================

function detectPageType() {
    const url = new URL(window.location.href);
    const host = url.hostname.toLowerCase();
    const path = url.pathname.toLowerCase();

    if (host.includes("linkedin.com") && path.includes("/jobs")) {
        return "linkedin_job";
    }

    if (
        host.includes("naukri.com") &&
        (path.includes("/job-listings-") || path.includes("/job"))
    ) {
        return "naukri_job";
    }

    if (host.includes("greenhouse.io")) {
        return "greenhouse_job";
    }

    if (host.includes("workdayjobs.com")) {
        return "workday_job";
    }

    if (
        document.querySelector('form[action*="google.com"]') ||
        (host === "docs.google.com" && path.includes("/forms")) ||
        host === "forms.gle"
    ) {
        return "google_form";
    }

    return "unknown";
}

// =====================================================
// JOB EXTRACTION
// =====================================================

function extractNaukriData() {
    return {
        jobTitle: firstText([
            "h1.jd-header-title",
            'h1[class*="jd-header-title"]',
            'h1[class*="styles_jd-header-title"]',
            "h1"
        ]),
        company: firstText([
            ".jd-header-comp-name",
            '[class*="jd-header-comp-name"]',
            '[class*="companyName"]',
            '[class*="company-name"]',
            '[class*="comp-name"]'
        ]),
        location: firstText([
            ".jd-header-comp-name + span",
            '[class*="location"]',
            '[class*="locWdth"]',
            '[class*="job-location"]'
        ]),
        description: getDescription([
            "#jobDescriptionText",
            ".job-desc",
            '[class*="job-desc"]',
            '[class*="jobDescription"]',
            '[class*="description"]'
        ])
    };
}

function extractGenericData() {
    return {
        jobTitle: firstText([
            "h1",
            'meta[property="og:title"]',
            'meta[name="twitter:title"]',
            "title"
        ]),
        company: firstText([
            '[itemprop="hiringOrganization"]',
            '[class*="company"]',
            '[class*="employer"]',
            '[class*="organization"]'
        ]),
        location: firstText([
            '[itemprop="jobLocation"]',
            '[class*="location"]',
            '[class*="loc"]'
        ]),
        description: getDescription([
            '[itemprop="description"]',
            '[class*="job-description"]',
            '[class*="jobDescription"]',
            '[class*="description"]',
            '[id*="description"]',
            'meta[name="description"]',
            'meta[property="og:description"]'
        ])
    };
}

function extractJobData() {
    const pageType = detectPageType();
    const extractedData = pageType === "naukri_job"
        ? extractNaukriData()
        : extractGenericData();

    return {
        pageType,
        jobTitle: extractedData.jobTitle,
        company: extractedData.company,
        location: extractedData.location,
        description: extractedData.description,
        jobUrl: window.location.href
    };
}


// =====================================================
// MESSAGE HANDLING
// =====================================================

    chrome.runtime.onMessage.addListener(
        (message, sender, sendResponse) => {

        // Popup asks:
        // "Give me the current page information"

            if (message?.type !== "GET_PAGE_DATA") {
                return false;
            }

            try {
                const jobData =
                    extractJobData();

                console.log(
                    "CareerOS extracted data:",
                    jobData
                );

                sendResponse({
                    success: true,
                    data: jobData,
                });
            } catch (error) {
                console.error(
                    "CareerOS extraction failed:",
                    error
                );

                sendResponse({
                    success: false,
                    error: "Unable to extract page data."
                });
            }

            return true;
        }
    );

// =====================================================
// BACKGROUND API HELPER
// =====================================================

function callBackgroundApi(action, payload) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            { type: "CAREEROS_API_REQUEST", action, payload },
            (response) => {
                if (chrome.runtime.lastError) {
                    return reject(new Error(chrome.runtime.lastError.message || "Failed to communicate with CareerOS background service."));
                }
                if (!response) {
                    return reject(new Error("No response from CareerOS background service."));
                }
                if (!response.success) {
                    const error = new Error(response.error?.message || "Operation failed.");
                    error.status = response.error?.status;
                    return reject(error);
                }
                resolve(response.data);
            }
        );
    });
}

// =====================================================
// IN-PAGE ASSISTANT (FLOATING LAUNCHER & SHADOW DOM DRAWER)
// =====================================================

const HOST_ID = "careeros-assistant-root";

function initCareerOSAssistant() {
    if (globalThis.__careerOSDrawerInjected || document.getElementById(HOST_ID)) {
        return;
    }
    globalThis.__careerOSDrawerInjected = true;

    const host = document.createElement("div");
    host.id = HOST_ID;
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: "open" });

    // Internal state
    let currentJob = extractJobData();
    let currentJobId = null;
    let currentCoverLetterId = null;
    let isDrawerOpen = false;

    let isSaving = false;
    let isAnalyzing = false;
    let isMatching = false;
    let isGeneratingCL = false;
    let isCreatingApp = false;

    // Styles
    const style = document.createElement("style");
    style.textContent = `
        :host {
            all: initial;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
            font-size: 13px;
            color: #1e293b;
            box-sizing: border-box;
            line-height: 1.4;
        }

        *, *::before, *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        .careeros-launcher {
            position: fixed;
            bottom: 24px;
            right: 24px;
            height: 46px;
            padding: 0 16px;
            border-radius: 23px;
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: #ffffff;
            font-size: 13px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 14px 0 rgba(79, 70, 229, 0.4);
            cursor: pointer;
            border: none;
            z-index: 2147483647;
            transition: transform 0.18s ease, box-shadow 0.18s ease;
            user-select: none;
        }

        .careeros-launcher:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px 0 rgba(79, 70, 229, 0.5);
        }

        .careeros-launcher:active {
            transform: translateY(0);
        }

        .careeros-drawer {
            position: fixed;
            bottom: 80px;
            right: 24px;
            width: 390px;
            max-width: calc(100vw - 32px);
            max-height: calc(100vh - 100px);
            background: #ffffff;
            border-radius: 14px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            z-index: 2147483647;
            transition: opacity 0.2s ease, transform 0.2s ease;
            opacity: 0;
            pointer-events: none;
            transform: translateY(10px) scale(0.98);
        }

        .careeros-drawer.open {
            opacity: 1;
            pointer-events: auto;
            transform: translateY(0) scale(1);
        }

        .drawer-header {
            padding: 14px 16px;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .drawer-header-left {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .drawer-logo-badge {
            width: 28px;
            height: 28px;
            border-radius: 8px;
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
        }

        .drawer-title {
            font-size: 14px;
            font-weight: 700;
            color: #0f172a;
        }

        .page-badge {
            display: inline-block;
            font-size: 10px;
            font-weight: 600;
            padding: 2px 6px;
            border-radius: 4px;
            background: #e0e7ff;
            color: #4338ca;
            margin-top: 2px;
            text-transform: capitalize;
        }

        .drawer-header-actions {
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .icon-btn {
            background: transparent;
            border: none;
            color: #64748b;
            cursor: pointer;
            padding: 6px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.15s ease, color 0.15s ease;
        }

        .icon-btn:hover {
            background: #e2e8f0;
            color: #1e293b;
        }

        .status-banner {
            padding: 8px 14px;
            font-size: 12px;
            font-weight: 500;
            display: none;
            border-bottom: 1px solid transparent;
        }

        .status-banner.error {
            display: block;
            background: #fef2f2;
            color: #b91c1c;
            border-bottom-color: #fecaca;
        }

        .status-banner.warning {
            display: block;
            background: #fffbeb;
            color: #b45309;
            border-bottom-color: #fde68a;
        }

        .status-banner.success {
            display: block;
            background: #f0fdf4;
            color: #15803d;
            border-bottom-color: #bbf7d0;
        }

        .status-banner.info {
            display: block;
            background: #eff6ff;
            color: #1d4ed8;
            border-bottom-color: #bfdbfe;
        }

        .drawer-body {
            padding: 14px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
            max-height: calc(100vh - 180px);
        }

        .card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .card-header {
            font-size: 12px;
            font-weight: 700;
            color: #334155;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .form-group label {
            font-size: 11px;
            font-weight: 600;
            color: #475569;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
            width: 100%;
            padding: 7px 10px;
            border-radius: 6px;
            border: 1px solid #cbd5e1;
            font-size: 12px;
            color: #1e293b;
            font-family: inherit;
            background: #ffffff;
            transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
            outline: none;
            border-color: #6366f1;
            box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
        }

        .form-group textarea {
            resize: vertical;
            min-height: 54px;
        }

        .button-row {
            display: flex;
            gap: 8px;
            margin-top: 4px;
        }

        .btn {
            flex: 1;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            transition: background 0.15s ease, opacity 0.15s ease, transform 0.1s ease;
            text-align: center;
        }

        .btn:active:not(:disabled) {
            transform: scale(0.98);
        }

        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .btn-primary {
            background: #4f46e5;
            color: #ffffff;
        }

        .btn-primary:hover:not(:disabled) {
            background: #4338ca;
        }

        .btn-secondary {
            background: #0ea5e9;
            color: #ffffff;
        }

        .btn-secondary:hover:not(:disabled) {
            background: #0284c7;
        }

        .btn-outline {
            background: #ffffff;
            border: 1px solid #cbd5e1;
            color: #334155;
        }

        .btn-outline:hover:not(:disabled) {
            background: #f1f5f9;
            border-color: #94a3b8;
        }

        .btn-sm {
            padding: 5px 10px;
            font-size: 11px;
        }

        .analysis-section {
            margin-top: 8px;
            border-top: 1px solid #f1f5f9;
            padding-top: 8px;
        }

        .analysis-section h4 {
            font-size: 11px;
            font-weight: 700;
            color: #475569;
            margin-bottom: 4px;
            text-transform: uppercase;
        }

        .analysis-section p {
            font-size: 12px;
            color: #334155;
            line-height: 1.4;
        }

        .analysis-section ul {
            padding-left: 16px;
            font-size: 12px;
            color: #334155;
        }

        .analysis-section li {
            margin-bottom: 2px;
        }

        .match-score-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            color: #15803d;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 700;
            margin-bottom: 8px;
        }

        .skills-tag-container {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            margin-top: 4px;
            margin-bottom: 8px;
        }

        .skill-tag {
            font-size: 11px;
            padding: 2px 7px;
            border-radius: 4px;
            font-weight: 500;
        }

        .skill-matching {
            background: #dcfce7;
            color: #166534;
        }

        .skill-missing {
            background: #fee2e2;
            color: #991b1b;
        }
    `;

    // DOM Markup
    const container = document.createElement("div");
    container.innerHTML = `
        <button class="careeros-launcher" id="launcher-btn" title="Open CareerOS">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
            <span>CareerOS</span>
        </button>

        <div class="careeros-drawer" id="drawer">
            <div class="drawer-header">
                <div class="drawer-header-left">
                    <div class="drawer-logo-badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                        </svg>
                    </div>
                    <div>
                        <div class="drawer-title">CareerOS Assistant</div>
                        <div class="page-badge" id="page-badge">Detecting...</div>
                    </div>
                </div>
                <div class="drawer-header-actions">
                    <button class="icon-btn" id="reextract-btn" title="Re-extract from page">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="23 4 23 10 17 10"></polyline>
                            <polyline points="1 20 1 14 7 14"></polyline>
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                        </svg>
                    </button>
                    <button class="icon-btn" id="close-btn" title="Close">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </div>

            <div class="status-banner" id="status-banner"></div>

            <div class="drawer-body">
                <!-- Job Details Card (Editable) -->
                <div class="card">
                    <div class="card-header">Job Details</div>
                    <div class="form-group">
                        <label>Job Title *</label>
                        <input type="text" id="job-title-input" placeholder="e.g. Senior Frontend Engineer" />
                    </div>
                    <div class="form-group">
                        <label>Company *</label>
                        <input type="text" id="job-company-input" placeholder="e.g. Acme Corp" />
                    </div>
                    <div class="form-group">
                        <label>Location</label>
                        <input type="text" id="job-location-input" placeholder="e.g. Remote, India" />
                    </div>
                    <div class="form-group">
                        <label>Job URL *</label>
                        <input type="text" id="job-url-input" placeholder="https://..." />
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="job-desc-input" rows="3" placeholder="Job description..."></textarea>
                    </div>
                    <div class="button-row">
                        <button class="btn btn-primary" id="save-job-btn">Save Job</button>
                        <button class="btn btn-secondary" id="analyze-job-btn">Analyze Job</button>
                    </div>
                </div>

                <!-- Analysis Card -->
                <div class="card" id="analysis-card" style="display:none;">
                    <div class="card-header">AI Job Analysis</div>
                    <div id="analysis-content"></div>
                </div>

                <!-- Resume & Application Card -->
                <div class="card" id="resume-card" style="display:none;">
                    <div class="card-header">Resume & Matching</div>
                    <div class="form-group">
                        <label>Select Resume</label>
                        <select id="resume-select">
                            <option value="">Loading resumes...</option>
                        </select>
                    </div>
                    <div class="button-row">
                        <button class="btn btn-outline" id="match-resume-btn" disabled>Match Resume</button>
                        <button class="btn btn-outline" id="gen-cover-btn" disabled>Cover Letter</button>
                    </div>

                    <!-- Match Result Box -->
                    <div id="match-result-box" style="display:none; margin-top:10px;"></div>

                    <!-- Cover Letter Result Box -->
                    <div id="cover-letter-box" style="display:none; margin-top:10px;">
                        <div class="form-group">
                            <label>Generated Cover Letter</label>
                            <textarea id="cover-letter-text" rows="6"></textarea>
                        </div>
                        <div class="button-row" style="margin-top:6px;">
                            <button class="btn btn-outline btn-sm" id="copy-cl-btn">Copy</button>
                            <button class="btn btn-primary btn-sm" id="add-app-btn">Add to Applications</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    shadow.appendChild(style);
    shadow.appendChild(container);

    // Element references
    const launcherBtn = shadow.getElementById("launcher-btn");
    const drawer = shadow.getElementById("drawer");
    const closeBtn = shadow.getElementById("close-btn");
    const reextractBtn = shadow.getElementById("reextract-btn");
    const pageBadge = shadow.getElementById("page-badge");
    const statusBanner = shadow.getElementById("status-banner");

    const jobTitleInput = shadow.getElementById("job-title-input");
    const jobCompanyInput = shadow.getElementById("job-company-input");
    const jobLocationInput = shadow.getElementById("job-location-input");
    const jobUrlInput = shadow.getElementById("job-url-input");
    const jobDescInput = shadow.getElementById("job-desc-input");

    const saveJobBtn = shadow.getElementById("save-job-btn");
    const analyzeJobBtn = shadow.getElementById("analyze-job-btn");

    const analysisCard = shadow.getElementById("analysis-card");
    const analysisContent = shadow.getElementById("analysis-content");

    const resumeCard = shadow.getElementById("resume-card");
    const resumeSelect = shadow.getElementById("resume-select");
    const matchResumeBtn = shadow.getElementById("match-resume-btn");
    const genCoverBtn = shadow.getElementById("gen-cover-btn");
    const matchResultBox = shadow.getElementById("match-result-box");
    const coverLetterBox = shadow.getElementById("cover-letter-box");
    const coverLetterText = shadow.getElementById("cover-letter-text");
    const copyClBtn = shadow.getElementById("copy-cl-btn");
    const addAppBtn = shadow.getElementById("add-app-btn");

    // Banner notifications
    function showBanner(message, type = "info") {
        statusBanner.className = `status-banner ${type}`;
        statusBanner.textContent = message;
        statusBanner.style.display = "block";
    }

    function clearBanner() {
        statusBanner.className = "status-banner";
        statusBanner.textContent = "";
        statusBanner.style.display = "none";
    }

    // Toggle drawer
    function toggleDrawer(open) {
        isDrawerOpen = typeof open === "boolean" ? open : !isDrawerOpen;
        if (isDrawerOpen) {
            drawer.classList.add("open");
        } else {
            drawer.classList.remove("open");
        }
    }

    // Populate extracted job into form
    function populateJobForm(data) {
        currentJob = data || {};
        jobTitleInput.value = currentJob.jobTitle || "";
        jobCompanyInput.value = currentJob.company || "";
        jobLocationInput.value = currentJob.location || "";
        jobUrlInput.value = currentJob.jobUrl || window.location.href;
        jobDescInput.value = currentJob.description || "";

        const pageType = currentJob.pageType || detectPageType();
        if (pageType === "naukri_job") {
            pageBadge.textContent = "Naukri Job";
        } else if (pageType === "linkedin_job") {
            pageBadge.textContent = "LinkedIn Job";
        } else if (pageType === "greenhouse_job") {
            pageBadge.textContent = "Greenhouse Job";
        } else if (pageType === "workday_job") {
            pageBadge.textContent = "Workday Job";
        } else {
            pageBadge.textContent = "Webpage";
        }
    }

    // Refresh extraction
    function handleReextract() {
        try {
            const data = extractJobData();
            populateJobForm(data);
            showBanner("Job details re-extracted from page.", "info");
        } catch (err) {
            showBanner("Could not extract job from page. You can fill details manually.", "warning");
        }
    }

    // Load user resumes
    async function loadResumes() {
        resumeCard.style.display = "flex";
        try {
            const resumes = await callBackgroundApi("getResumes");
            const resumeList = Array.isArray(resumes) ? resumes : (resumes?.data || []);

            resumeSelect.innerHTML = "";
            if (!resumeList || resumeList.length === 0) {
                resumeSelect.innerHTML = "<option value=''>No resumes found in CareerOS</option>";
                matchResumeBtn.disabled = true;
                genCoverBtn.disabled = true;
                return;
            }

            resumeList.forEach((resume) => {
                const opt = document.createElement("option");
                opt.value = resume._id;
                opt.textContent = resume.title + (resume.isDefault ? " (Default)" : "");
                if (resume.isDefault) opt.selected = true;
                resumeSelect.appendChild(opt);
            });

            matchResumeBtn.disabled = false;
            genCoverBtn.disabled = false;
        } catch (error) {
            console.error("CareerOS assistant resume fetch error:", error);
            if (error.status === 401 || error.status === 403) {
                showBanner("Your session has expired. Open the CareerOS extension popup and log in again.", "warning");
            }
            resumeSelect.innerHTML = "<option value=''>Failed to load resumes</option>";
            matchResumeBtn.disabled = true;
            genCoverBtn.disabled = true;
        }
    }

    // Save Job Handler
    async function handleSaveJob() {
        if (isSaving) return;

        const jobPayload = {
            jobTitle: jobTitleInput.value.trim(),
            company: jobCompanyInput.value.trim(),
            location: jobLocationInput.value.trim(),
            description: jobDescInput.value.trim(),
            jobUrl: jobUrlInput.value.trim() || window.location.href,
        };

        if (!jobPayload.jobTitle || !jobPayload.company || !jobPayload.jobUrl) {
            showBanner("Job title, company, and URL are required.", "warning");
            return;
        }

        isSaving = true;
        saveJobBtn.disabled = true;
        saveJobBtn.textContent = "Saving...";
        clearBanner();

        try {
            const response = await callBackgroundApi("saveJob", jobPayload);
            const saved = response?.data || response;
            if (saved?._id) {
                currentJobId = saved._id;
            }
            saveJobBtn.textContent = "Saved ✓";
            showBanner("Job saved successfully to CareerOS!", "success");
            loadResumes();
        } catch (error) {
            console.error("CareerOS assistant save job error:", error);
            saveJobBtn.disabled = false;
            saveJobBtn.textContent = "Save Job";

            if (error.status === 401 || error.status === 403) {
                showBanner("Your session has expired. Open the CareerOS extension popup and log in again.", "warning");
            } else if (error.status === 409) {
                showBanner("Job is already saved in CareerOS.", "info");
                saveJobBtn.textContent = "Saved ✓";
                loadResumes();
            } else {
                showBanner(error.message || "Failed to save job.", "error");
            }
        } finally {
            isSaving = false;
        }
    }

    // Render Analysis
    function renderAnalysis(analysis) {
        analysisContent.innerHTML = "";
        analysisCard.style.display = "flex";

        if (!analysis || typeof analysis !== "object") {
            analysisContent.innerHTML = "<p>No analysis details returned.</p>";
            return;
        }

        if (analysis.summary?.trim()) {
            const sec = document.createElement("div");
            sec.className = "analysis-section";
            sec.innerHTML = `<h4>Summary</h4><p>${analysis.summary}</p>`;
            analysisContent.appendChild(sec);
        }

        const fields = [
            { key: "skills", label: "Skills" },
            { key: "requirements", label: "Requirements" },
            { key: "responsibilities", label: "Responsibilities" },
            { key: "technologies", label: "Technologies" },
            { key: "domains", label: "Domains" },
        ];

        fields.forEach(({ key, label }) => {
            const items = Array.isArray(analysis[key])
                ? analysis[key].filter((item) => item && String(item).trim())
                : [];

            if (!items.length) return;

            const sec = document.createElement("div");
            sec.className = "analysis-section";
            const ul = document.createElement("ul");
            items.forEach((item) => {
                const li = document.createElement("li");
                li.textContent = item;
                ul.appendChild(li);
            });
            sec.innerHTML = `<h4>${label}</h4>`;
            sec.appendChild(ul);
            analysisContent.appendChild(sec);
        });
    }

    // Analyze Job Handler
    async function handleAnalyzeJob() {
        if (isAnalyzing) return;

        // Ensure job is saved first
        if (!currentJobId) {
            const jobPayload = {
                jobTitle: jobTitleInput.value.trim(),
                company: jobCompanyInput.value.trim(),
                location: jobLocationInput.value.trim(),
                description: jobDescInput.value.trim(),
                jobUrl: jobUrlInput.value.trim() || window.location.href,
            };

            if (!jobPayload.jobTitle || !jobPayload.company || !jobPayload.jobUrl) {
                showBanner("Please provide job title and company first.", "warning");
                return;
            }

            analyzeJobBtn.disabled = true;
            analyzeJobBtn.textContent = "Saving job first...";

            try {
                const saveRes = await callBackgroundApi("saveJob", jobPayload);
                const saved = saveRes?.data || saveRes;
                if (saved?._id) {
                    currentJobId = saved._id;
                    saveJobBtn.textContent = "Saved ✓";
                }
            } catch (saveErr) {
                analyzeJobBtn.disabled = false;
                analyzeJobBtn.textContent = "Analyze Job";
                if (saveErr.status === 401 || saveErr.status === 403) {
                    showBanner("Your session has expired. Open the CareerOS extension popup and log in again.", "warning");
                } else if (saveErr.status === 409) {
                    // Already saved, proceed with analysis if we can find job or notify
                    showBanner("Job is already saved. Click Analyze Job again.", "info");
                } else {
                    showBanner(saveErr.message || "Failed to save job before analysis.", "error");
                }
                return;
            }
        }

        if (!currentJobId) {
            showBanner("Please save the job first before analyzing.", "warning");
            analyzeJobBtn.disabled = false;
            analyzeJobBtn.textContent = "Analyze Job";
            return;
        }

        isAnalyzing = true;
        analyzeJobBtn.disabled = true;
        analyzeJobBtn.textContent = "Analyzing with AI...";
        clearBanner();

        try {
            const response = await callBackgroundApi("analyzeJob", { jobId: currentJobId });
            const analysis = response?.analysis || response?.data?.analysis || response;
            renderAnalysis(analysis);
            showBanner("Job analysis ready!", "success");
            loadResumes();
        } catch (error) {
            console.error("CareerOS assistant analyze error:", error);
            if (error.status === 401 || error.status === 403) {
                showBanner("Your session has expired. Open the CareerOS extension popup and log in again.", "warning");
            } else {
                showBanner(error.message || "Failed to analyze job.", "error");
            }
        } finally {
            isAnalyzing = false;
            analyzeJobBtn.disabled = false;
            analyzeJobBtn.textContent = "Analyze Job";
        }
    }

    // Render Match Result
    function renderMatchResult(match) {
        matchResultBox.innerHTML = "";
        matchResultBox.style.display = "block";
        coverLetterBox.style.display = "none";

        const score = match.matchScore ?? 0;
        const scoreBadge = document.createElement("div");
        scoreBadge.className = "match-score-badge";
        scoreBadge.innerHTML = `<span>Match Score:</span> <span>${score}%</span>`;
        matchResultBox.appendChild(scoreBadge);

        if (Array.isArray(match.matchingSkills) && match.matchingSkills.length > 0) {
            const title = document.createElement("div");
            title.style.fontSize = "11px";
            title.style.fontWeight = "600";
            title.style.color = "#166534";
            title.textContent = "Matching Skills:";
            matchResultBox.appendChild(title);

            const tags = document.createElement("div");
            tags.className = "skills-tag-container";
            match.matchingSkills.forEach((s) => {
                const tag = document.createElement("span");
                tag.className = "skill-tag skill-matching";
                tag.textContent = s;
                tags.appendChild(tag);
            });
            matchResultBox.appendChild(tags);
        }

        if (Array.isArray(match.missingSkills) && match.missingSkills.length > 0) {
            const title = document.createElement("div");
            title.style.fontSize = "11px";
            title.style.fontWeight = "600";
            title.style.color = "#991b1b";
            title.textContent = "Missing Skills:";
            matchResultBox.appendChild(title);

            const tags = document.createElement("div");
            tags.className = "skills-tag-container";
            match.missingSkills.forEach((s) => {
                const tag = document.createElement("span");
                tag.className = "skill-tag skill-missing";
                tag.textContent = s;
                tags.appendChild(tag);
            });
            matchResultBox.appendChild(tags);
        }
    }

    // Match Resume Handler
    async function handleMatchResume() {
        if (isMatching) return;

        const resumeId = resumeSelect.value;
        if (!resumeId) {
            showBanner("Please select a resume first.", "warning");
            return;
        }

        if (!currentJobId) {
            showBanner("Please save or analyze the job first.", "warning");
            return;
        }

        isMatching = true;
        matchResumeBtn.disabled = true;
        matchResumeBtn.textContent = "Matching...";
        clearBanner();

        try {
            const matchAnalysis = await callBackgroundApi("matchResume", {
                jobId: currentJobId,
                resumeId,
            });
            renderMatchResult(matchAnalysis);
            showBanner("Resume match analysis complete!", "success");
        } catch (error) {
            console.error("CareerOS assistant match resume error:", error);
            if (error.status === 400) {
                showBanner("Please analyze the job first before matching.", "warning");
            } else if (error.status === 401 || error.status === 403) {
                showBanner("Your session has expired. Open the CareerOS extension popup and log in again.", "warning");
            } else {
                showBanner(error.message || "Failed to match resume.", "error");
            }
        } finally {
            isMatching = false;
            matchResumeBtn.disabled = false;
            matchResumeBtn.textContent = "Match Resume";
        }
    }

    // Render Cover Letter
    function renderCoverLetter(content) {
        matchResultBox.style.display = "none";
        coverLetterBox.style.display = "block";
        coverLetterText.value = content || "";
    }

    // Generate Cover Letter Handler
    async function handleGenerateCoverLetter() {
        if (isGeneratingCL) return;

        const resumeId = resumeSelect.value;
        if (!resumeId) {
            showBanner("Please select a resume first.", "warning");
            return;
        }

        if (!currentJobId) {
            showBanner("Please save or analyze the job first.", "warning");
            return;
        }

        isGeneratingCL = true;
        genCoverBtn.disabled = true;
        genCoverBtn.textContent = "Generating...";
        clearBanner();

        try {
            const result = await callBackgroundApi("generateCoverLetter", {
                jobId: currentJobId,
                resumeId,
            });
            currentCoverLetterId = result?._id || result?.coverLetter?._id || null;
            const content = result?.content || (typeof result === "string" ? result : "");
            renderCoverLetter(content);
            showBanner("Cover letter generated!", "success");
        } catch (error) {
            console.error("CareerOS assistant cover letter error:", error);
            if (error.status === 401 || error.status === 403) {
                showBanner("Your session has expired. Open the CareerOS extension popup and log in again.", "warning");
            } else {
                showBanner(error.message || "Failed to generate cover letter.", "error");
            }
        } finally {
            isGeneratingCL = false;
            genCoverBtn.disabled = false;
            genCoverBtn.textContent = "Cover Letter";
        }
    }

    // Copy Cover Letter
    function handleCopyCoverLetter() {
        if (!coverLetterText.value) return;
        navigator.clipboard.writeText(coverLetterText.value).then(() => {
            copyClBtn.textContent = "Copied ✓";
            setTimeout(() => {
                copyClBtn.textContent = "Copy";
            }, 2000);
        });
    }

    // Add Application Handler
    async function handleAddApplication() {
        if (isCreatingApp) return;

        const resumeId = resumeSelect.value;
        if (!currentJobId || !resumeId) {
            showBanner("Job and resume are required.", "warning");
            return;
        }

        isCreatingApp = true;
        addAppBtn.disabled = true;
        addAppBtn.textContent = "Saving...";

        try {
            await callBackgroundApi("createApplication", {
                jobId: currentJobId,
                resumeId,
                coverLetterId: currentCoverLetterId,
            });
            addAppBtn.textContent = "Saved ✓";
            showBanner("Added to your CareerOS applications!", "success");
        } catch (error) {
            console.error("CareerOS assistant create application error:", error);
            addAppBtn.disabled = false;
            addAppBtn.textContent = "Add to Applications";
            if (error.status === 401 || error.status === 403) {
                showBanner("Your session has expired. Open the CareerOS extension popup and log in again.", "warning");
            } else {
                showBanner(error.message || "Failed to create application.", "error");
            }
        } finally {
            isCreatingApp = false;
        }
    }

    // Event listeners
    launcherBtn.addEventListener("click", () => toggleDrawer());
    closeBtn.addEventListener("click", () => toggleDrawer(false));
    reextractBtn.addEventListener("click", handleReextract);
    saveJobBtn.addEventListener("click", handleSaveJob);
    analyzeJobBtn.addEventListener("click", handleAnalyzeJob);
    matchResumeBtn.addEventListener("click", handleMatchResume);
    genCoverBtn.addEventListener("click", handleGenerateCoverLetter);
    copyClBtn.addEventListener("click", handleCopyCoverLetter);
    addAppBtn.addEventListener("click", handleAddApplication);

    // Initial populate
    populateJobForm(currentJob);
}

// Ensure assistant initializes after DOM is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCareerOSAssistant, { once: true });
} else {
    initCareerOSAssistant();
}

} // End of globalThis.__careerOSContentScriptLoaded