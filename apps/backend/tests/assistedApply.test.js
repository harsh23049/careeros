import axios from "axios";

const API_URL = "http://localhost:8000/api/v1";

const logPass = (title) => console.log(`  \x1b[32m✔ PASS\x1b[0m: ${title}`);
const logFail = (title, err) => {
    console.error(`  \x1b[31m✖ FAIL\x1b[0m: ${title}`);
    if (err) console.error("   ", err?.response?.data || err.message);
    process.exitCode = 1;
};

async function runAssistedApplyTests() {
    console.log("\n=======================================================");
    console.log("   CareerOS Assisted Apply Verification Tests");
    console.log("=======================================================\n");

    const timestamp = Date.now();
    const userAEmail = `assist_user_a_${timestamp}@careeros.test`;
    const userBEmail = `assist_user_b_${timestamp}@careeros.test`;
    const password = "AssistPassword123!";

    const clientUnauth = axios.create({ baseURL: API_URL, validateStatus: () => true });

    try {
        // Step 1: Users Setup
        console.log("▶ Step 1: User Registration & Authentication Setup");
        const regARes = await clientUnauth.post("/users/register", {
            fullName: "Alice AssistTester",
            username: `alice_assist_${timestamp}`,
            email: userAEmail,
            password,
        });
        if (regARes.status !== 201) throw new Error("Failed to register User A");

        const loginARes = await clientUnauth.post("/users/login", { email: userAEmail, password });
        const tokenA = loginARes.data.data.accessToken;

        const regBRes = await clientUnauth.post("/users/register", {
            fullName: "Bob AssistTester",
            username: `bob_assist_${timestamp}`,
            email: userBEmail,
            password,
        });
        if (regBRes.status !== 201) throw new Error("Failed to register User B");

        const loginBRes = await clientUnauth.post("/users/login", { email: userBEmail, password });
        const tokenB = loginBRes.data.data.accessToken;

        const clientA = axios.create({
            baseURL: API_URL,
            headers: { Authorization: `Bearer ${tokenA}` },
            validateStatus: () => true,
        });

        const clientB = axios.create({
            baseURL: API_URL,
            headers: { Authorization: `Bearer ${tokenB}` },
            validateStatus: () => true,
        });
        logPass("User A & B registered and authenticated with isolated tokens");

        // Step 2: Save Job with application URL
        console.log("\n▶ Step 2: Save Target Job for Assisted Apply");
        const jobUrl = `https://jobs.example.com/roles/staff-engineer-${timestamp}`;
        const saveJobRes = await clientA.post("/jobs", {
            jobTitle: "Staff Platform Engineer",
            company: "TechNova Corp",
            location: "San Francisco, CA (Remote)",
            jobUrl,
            description: "Lead platform infrastructure and cloud scale systems.",
        });

        if (saveJobRes.status !== 201) throw new Error("Failed to create job for User A: " + JSON.stringify(saveJobRes.data));
        const jobId = saveJobRes.data.data._id;
        logPass(`Job saved with ID ${jobId} and application URL ${jobUrl}`);

        // Step 3: Record Assisted Apply Application
        console.log("\n▶ Step 3: Record Extension-Assisted Application");
        const applyRes = await clientA.post("/applications", {
            jobId,
            status: "applied",
            notes: "Applied via CareerOS Assisted Apply workflow",
            source: "extension-assisted",
        });

        if (applyRes.status !== 201 && applyRes.status !== 200) {
            throw new Error(`Failed to record application: ${JSON.stringify(applyRes.data)}`);
        }

        const appData = applyRes.data.data;
        if (appData.status !== "applied") {
            throw new Error(`Expected status to be "applied", got "${appData.status}"`);
        }
        if (appData.source !== "extension-assisted") {
            throw new Error(`Expected source to be "extension-assisted", got "${appData.source}"`);
        }
        if (!appData.appliedAt) {
            throw new Error("Expected appliedAt timestamp to be populated");
        }
        logPass(`Application recorded with status: "applied", source: "extension-assisted", appliedAt: ${appData.appliedAt}`);

        // Step 4: Verify Idempotency and Deduplication on Repeated Submissions
        console.log("\n▶ Step 4: Test Idempotency (Retry Safe / Zero Duplicate Records)");
        const retryRes = await clientA.post("/applications", {
            jobId,
            status: "applied",
            notes: "Retried submission via Assisted Apply",
            source: "extension-assisted",
        });

        if (retryRes.status !== 200 && retryRes.status !== 201) {
            throw new Error(`Retry request failed: ${JSON.stringify(retryRes.data)}`);
        }

        // Fetch all applications for User A
        const listRes = await clientA.get("/applications");
        const allApps = listRes.data.data || [];
        const matchingApps = allApps.filter((a) => (a.job?._id || a.job) === jobId);

        if (matchingApps.length !== 1) {
            throw new Error(`Expected exactly 1 application record for job ${jobId}, found ${matchingApps.length}`);
        }
        logPass("Repeated Assist Apply calls are idempotent: exactly 1 application record persisted");

        // Step 5: Multi-User Data Isolation
        console.log("\n▶ Step 5: Verify Multi-User Data Isolation");
        const userBListRes = await clientB.get("/applications");
        const userBApps = userBListRes.data.data || [];
        const leakedApp = userBApps.find((a) => (a.job?._id || a.job) === jobId);

        if (leakedApp) {
            throw new Error(`Data leak detected: User B can see User A's application ${leakedApp._id}`);
        }
        logPass("User B cannot access or view User A's assisted application records");

        // Step 6: Unauthenticated Access Rejection
        console.log("\n▶ Step 6: Unauthenticated Request Security");
        const unauthRes = await clientUnauth.post("/applications", {
            jobId,
            status: "applied",
            source: "extension-assisted",
        });

        if (unauthRes.status !== 401) {
            throw new Error(`Expected status 401 for unauthenticated request, got ${unauthRes.status}`);
        }
        logPass("Unauthenticated application requests are rejected with 401 Unauthorized");

        console.log("\n=======================================================");
        console.log("   \x1b[32mAll CareerOS Assisted Apply Tests Passed Successfully!\x1b[0m");
        console.log("=======================================================\n");
    } catch (err) {
        logFail("Assisted Apply Test Suite Error", err);
    }
}

runAssistedApplyTests();
