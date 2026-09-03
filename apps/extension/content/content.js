console.log("CareerOS content script loaded");

function getPageJobData() {
    return {
        jobTitle: document.title,
        jobUrl: window.location.href,
        description: document.body.innerText,
    };
}

chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {

        if (message.type === "GET_JOB_DATA") {
            const jobData = getPageJobData();

            sendResponse({
                success: true,
                data: jobData,
            });
        }

        return true;
    }
);