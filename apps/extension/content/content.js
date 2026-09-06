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
}