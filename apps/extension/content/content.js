console.log("CareerOS content script loaded");


// =====================================================
// PAGE TYPE DETECTION
// =====================================================

function detectPageType() {
    const url = window.location.href.toLowerCase();

    if (
        url.includes("linkedin.com/jobs")
    ) {
        return "linkedin_job";
    }

    if (
        url.includes("naukri.com/job")
    ) {
        return "naukri_job";
    }

    if (
        url.includes("greenhouse.io")
    ) {
        return "greenhouse_job";
    }

    if (
        url.includes("workdayjobs.com")
    ) {
        return "workday_job";
    }

    if (
        document.querySelector(
            'form[action*="google.com"]'
        )
    ) {
        return "google_form";
    }

    return "unknown";
}


// =====================================================
// BASIC JOB EXTRACTION
// =====================================================

function extractJobData() {

    const pageType = detectPageType();

    const jobData = {
        pageType,
        jobTitle: "",
        company: "",
        location: "",
        description: "",
        jobUrl: window.location.href,
    };


    // -------------------------------------------------
    // Job title
    // -------------------------------------------------

    const titleElement =
        document.querySelector("h1");

    if (titleElement) {
        jobData.jobTitle =
            titleElement.innerText.trim();
    }


    // -------------------------------------------------
    // Try to find company
    // -------------------------------------------------

    const companyElement =
        document.querySelector(
            '[class*="company"], [class*="employer"]'
        );

    if (companyElement) {
        jobData.company =
            companyElement.innerText.trim();
    }


    // -------------------------------------------------
    // Try to find location
    // -------------------------------------------------

    const locationElement =
        document.querySelector(
            '[class*="location"]'
        );

    if (locationElement) {
        jobData.location =
            locationElement.innerText.trim();
    }


    // -------------------------------------------------
    // Description
    // -------------------------------------------------

    const descriptionElement =
        document.querySelector(
            '[class*="description"], [id*="description"]'
        );

    if (descriptionElement) {

        jobData.description =
            descriptionElement.innerText.trim();

    } else {

        // Fallback
        jobData.description =
            document.body.innerText.trim();
    }


    return jobData;
}


// =====================================================
// MESSAGE HANDLING
// =====================================================

chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {

        // Popup asks:
        // "Give me the current page information"

        if (message.type === "GET_PAGE_DATA") {

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
        }

        return true;
    }
);