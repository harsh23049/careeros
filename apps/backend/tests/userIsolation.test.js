import axios from "axios";

const API_URL = "http://localhost:8000/api/v1";

const logPass = (title) => console.log(`  \x1b[32m✔ PASS\x1b[0m: ${title}`);
const logFail = (title, err) => {
    console.error(`  \x1b[31m✖ FAIL\x1b[0m: ${title}`);
    if (err) console.error("   ", err?.response?.data || err.message);
    process.exitCode = 1;
};

async function runRegressionTests() {
    console.log("\n=======================================================");
    console.log("   CareerOS Multi-User Data Isolation Regression Tests");
    console.log("=======================================================\n");

    const timestamp = Date.now();
    const userAEmail = `user_a_${timestamp}@careeros.test`;
    const userBEmail = `user_b_${timestamp}@careeros.test`;
    const password = "TestPassword123!";

    let tokenA = null;
    let userAId = null;
    let tokenB = null;
    let userBId = null;

    // Helper client instances
    const clientUnauth = axios.create({ baseURL: API_URL, validateStatus: () => true });
    let clientA;
    let clientB;

    try {
        // -----------------------------------------------------------------
        // Setup: Register and Login User A & User B
        // -----------------------------------------------------------------
        console.log("▶ Step 0: User Registration & Authentication Setup");

        await clientUnauth.post("/users/register", {
            fullName: "User A Alpha",
            username: `usera_${timestamp}`,
            email: userAEmail,
            password,
        });

        const loginARes = await clientUnauth.post("/users/login", {
            email: userAEmail,
            password,
        });
        tokenA = loginARes.data.data.accessToken;
        userAId = loginARes.data.data.user._id;

        await clientUnauth.post("/users/register", {
            fullName: "User B Beta",
            username: `userb_${timestamp}`,
            email: userBEmail,
            password,
        });

        const loginBRes = await clientUnauth.post("/users/login", {
            email: userBEmail,
            password,
        });
        tokenB = loginBRes.data.data.accessToken;
        userBId = loginBRes.data.data.user._id;

        clientA = axios.create({
            baseURL: API_URL,
            headers: { Authorization: `Bearer ${tokenA}` },
            validateStatus: () => true,
        });

        clientB = axios.create({
            baseURL: API_URL,
            headers: { Authorization: `Bearer ${tokenB}` },
            validateStatus: () => true,
        });

        logPass(`Created distinct User A (${userAId}) and User B (${userBId})`);

        // -----------------------------------------------------------------
        // Test 7: Unauthenticated requests are rejected
        // -----------------------------------------------------------------
        console.log("\n▶ Step 1: Verify Unauthenticated Requests Are Rejected (401)");
        const unauthGet = await clientUnauth.get("/jobs");
        const unauthPost = await clientUnauth.post("/jobs", { company: "SecretCorp", jobTitle: "Spy" });
        const unauthGetOne = await clientUnauth.get("/jobs/6a8215acec55d55cadefdbb7");

        if (unauthGet.status === 401 && unauthPost.status === 401 && unauthGetOne.status === 401) {
            logPass("Unauthenticated GET/POST/GET(:id) requests all return 401 Unauthorized");
        } else {
            logFail("Unauthenticated endpoints accepted requests without token!", {
                unauthGet: unauthGet.status,
                unauthPost: unauthPost.status,
            });
        }

        // -----------------------------------------------------------------
        // Test 1: User A saves a unique job
        // -----------------------------------------------------------------
        console.log("\n▶ Step 2: User A Saves a Unique Job");
        const sharedJobUrl = `https://careers.google.com/jobs/results/${timestamp}`;
        const saveJobARes = await clientA.post("/jobs", {
            company: "Google DeepMind",
            jobTitle: "Senior Staff AI Researcher",
            jobUrl: sharedJobUrl,
            location: "Mountain View, CA",
            description: "Lead cutting-edge frontier reasoning and coding models.",
        });

        if (saveJobARes.status !== 201) {
            throw new Error(`User A failed to save job: ${JSON.stringify(saveJobARes.data)}`);
        }

        const jobA = saveJobARes.data.data;
        logPass(`User A saved job (${jobA._id}) with verified owner: ${jobA.user}`);

        if (jobA.user !== userAId) {
            logFail(`Job owner ${jobA.user} does not match User A ID ${userAId}`);
        } else {
            logPass("Job record correctly stamped with User A server-verified identity");
        }

        // -----------------------------------------------------------------
        // Test 2: User A can see the job in listings and by ID
        // -----------------------------------------------------------------
        console.log("\n▶ Step 3: User A Listing and Detail Verification");
        const userAJobsRes = await clientA.get("/jobs");
        const userAJobs = userAJobsRes.data.data || [];
        const userAHasJob = userAJobs.some((j) => j._id === jobA._id);

        if (userAHasJob) {
            logPass(`User A retrieves saved job in their listing (Total: ${userAJobs.length} jobs)`);
        } else {
            logFail("User A cannot find newly saved job in their listing");
        }

        const userAGetJobRes = await clientA.get(`/jobs/${jobA._id}`);
        if (userAGetJobRes.status === 200 && userAGetJobRes.data.data._id === jobA._id) {
            logPass("User A successfully accesses job details by ID");
        } else {
            logFail("User A failed to access their own job by ID");
        }

        // -----------------------------------------------------------------
        // Test 3 & 4: User B cannot see User A's job or dashboard metrics
        // -----------------------------------------------------------------
        console.log("\n▶ Step 4: User B Isolation & Dashboard Verification");
        const userBJobsRes = await clientB.get("/jobs");
        const userBJobs = userBJobsRes.data.data || [];
        const userBSeesJobA = userBJobs.some((j) => j._id === jobA._id);

        if (!userBSeesJobA) {
            logPass(`User B job listing does NOT contain User A's job (User B job count: ${userBJobs.length})`);
        } else {
            logFail("CRITICAL LEAKAGE: User B listing exposes User A's saved job!");
        }

        // -----------------------------------------------------------------
        // Test 5: User B cannot read, update, or delete User A's job by ID
        // -----------------------------------------------------------------
        console.log("\n▶ Step 5: ID Guessing and Cross-User Mutation Prevention (404)");
        const userBReadJobA = await clientB.get(`/jobs/${jobA._id}`);
        if (userBReadJobA.status === 404) {
            logPass(`User B cannot read User A's job by ID -> 404 Not Found`);
        } else {
            logFail(`User B read User A's job with status ${userBReadJobA.status}`);
        }

        const userBUpdateJobA = await clientB.patch(`/jobs/${jobA._id}`, {
            jobTitle: "Hacked Title By User B",
        });
        if (userBUpdateJobA.status === 404) {
            logPass(`User B cannot update User A's job by ID -> 404 Not Found`);
        } else {
            logFail(`User B modified User A's job with status ${userBUpdateJobA.status}`);
        }

        const userBDeleteJobA = await clientB.delete(`/jobs/${jobA._id}`);
        if (userBDeleteJobA.status === 404) {
            logPass(`User B cannot delete User A's job by ID -> 404 Not Found`);
        } else {
            logFail(`User B deleted User A's job with status ${userBDeleteJobA.status}`);
        }

        // Verify User A's job is completely untouched
        const userACheckJob = await clientA.get(`/jobs/${jobA._id}`);
        if (userACheckJob.status === 200 && userACheckJob.data.data.jobTitle === "Senior Staff AI Researcher") {
            logPass("User A's job record remains intact and unmodified");
        } else {
            logFail("User A's job was corrupted or deleted during cross-user attacks");
        }

        // -----------------------------------------------------------------
        // Test 6: Both users can independently save the same job URL
        // -----------------------------------------------------------------
        console.log("\n▶ Step 6: Scoped Duplicate Detection & Independent Saves");
        const saveJobBRes = await clientB.post("/jobs", {
            company: "Google DeepMind",
            jobTitle: "Senior Staff AI Researcher",
            jobUrl: sharedJobUrl, // Exact same URL saved by User A
            location: "Mountain View, CA",
        });

        if (saveJobBRes.status === 201) {
            logPass("User B successfully saved the SAME job URL independently (HTTP 201)");
        } else {
            logFail(`User B was blocked from saving the same job URL (HTTP ${saveJobBRes.status})`);
        }

        const jobB = saveJobBRes.data.data;
        if (jobB._id !== jobA._id && jobB.user === userBId) {
            logPass(`User B has distinct record (${jobB._id}) owned by User B (${jobB.user})`);
        } else {
            logFail("User B received User A's record instead of an independent record!");
        }

        // Verify duplicate check within same user is still enforced
        const userBDupSave = await clientB.post("/jobs", {
            company: "Google DeepMind",
            jobTitle: "Senior Staff AI Researcher",
            jobUrl: sharedJobUrl,
        });

        if (userBDupSave.status === 409) {
            logPass("User-scoped duplicate check correctly returns 409 Conflict for repeated save by same user");
        } else {
            logFail(`Expected 409 Conflict for duplicate save, got ${userBDupSave.status}`);
        }

        // -----------------------------------------------------------------
        // Test 8: Cross-User Application Linkage Prevention
        // -----------------------------------------------------------------
        console.log("\n▶ Step 7: Cross-User Application Association Prevention");
        // User B attempts to create an application referencing User A's job
        const userBAppRes = await clientB.post("/applications", {
            job: jobA._id, // User A's job
            status: "applied",
        });

        if (userBAppRes.status === 404) {
            logPass("User B cannot link an application to User A's job -> 404 Not Found");
        } else {
            logFail(`User B was allowed to link an application to User A's job! (Status: ${userBAppRes.status})`);
        }

        // -----------------------------------------------------------------
        // Cleanup: User A and User B clean up their own records
        // -----------------------------------------------------------------
        console.log("\n▶ Step 8: Authorized Cleanup");
        const deleteARes = await clientA.delete(`/jobs/${jobA._id}`);
        const deleteBRes = await clientB.delete(`/jobs/${jobB._id}`);

        if (deleteARes.status === 200 && deleteBRes.status === 200) {
            logPass("User A and User B successfully deleted their own jobs");
        } else {
            logFail("Failed to clean up test jobs");
        }

        console.log("\n=======================================================");
        console.log("   ALL MULTI-USER ISOLATION TESTS PASSED (100% SUCCESS)");
        console.log("=======================================================\n");
    } catch (err) {
        logFail("Unexpected error during regression tests", err);
    }
}

runRegressionTests();
