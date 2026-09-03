const status = document.getElementById("status");
const jobTitle = document.getElementById("jobTitle");
const jobUrl = document.getElementById("jobUrl");
const saveJobButton = document.getElementById("saveJob");

let currentJob = null;

async function loadJob() {

    try {

        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true,
        });

        chrome.tabs.sendMessage(
            tab.id,
            {
                type: "GET_JOB_DATA",
            },
            (response) => {

                if (chrome.runtime.lastError) {
                    status.textContent =
                        "Unable to read this page.";

                    return;
                }

                if (!response?.success) {
                    status.textContent =
                        "Could not extract job.";

                    return;
                }

                currentJob = response.data;

                jobTitle.textContent =
                    currentJob.jobTitle;

                jobUrl.textContent =
                    currentJob.jobUrl;

                status.textContent =
                    "Job detected.";
            }
        );

    } catch (error) {

        console.error(error);

        status.textContent =
            "Something went wrong.";
    }
}

saveJobButton.addEventListener(
    "click",
    async () => {

        if (!currentJob) {
            status.textContent =
                "No job detected.";

            return;
        }

        console.log(
            "Job ready to save:",
            currentJob
        );

        status.textContent =
            "Job ready to save.";

        // Backend connection comes next.
    }
);

loadJob();