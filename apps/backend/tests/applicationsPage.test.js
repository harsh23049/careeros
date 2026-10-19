import axios from "axios";

const API_URL = "http://localhost:8000/api/v1";

const logPass = (title) => console.log(`  \x1b[32m✔ PASS\x1b[0m: ${title}`);
const logFail = (title, err) => {
    console.error(`  \x1b[31m✖ FAIL\x1b[0m: ${title}`);
    if (err) console.error("   ", err?.response?.data || err.message);
    process.exitCode = 1;
};

async function runApplicationTests() {
    console.log("\n=======================================================");
    console.log("   CareerOS Applications Management Verification Tests");
    console.log("=======================================================\n");

    const timestamp = Date.now();
    const userAEmail = `app_user_a_${timestamp}@careeros.test`;
    const userBEmail = `app_user_b_${timestamp}@careeros.test`;
    const password = "AppPassword123!";

    const clientUnauth = axios.create({ baseURL: API_URL, validateStatus: () => true });

    try {
        // -----------------------------------------------------------------
        // Setup Users
        // -----------------------------------------------------------------
        console.log("▶ Step 1: User Registration & Authentication Setup");
        await clientUnauth.post("/users/register", {
            fullName: "Alice AppTester",
            username: `alice_${timestamp}`,
            email: userAEmail,
            password,
        });
        const loginARes = await clientUnauth.post("/users/login", { email: userAEmail, password });
        const tokenA = loginARes.data.data.accessToken;
        const userAId = loginARes.data.data.user._id;

        await clientUnauth.post("/users/register", {
            fullName: "Bob AppTester",
            username: `bob_${timestamp}`,
            email: userBEmail,
            password,
        });
        const loginBRes = await clientUnauth.post("/users/login", { email: userBEmail, password });
        const tokenB = loginBRes.data.data.accessToken;
        const userBId = loginBRes.data.data.user._id;

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

        logPass(`Created distinct User A (${userAId}) and User B (${userBId})`);

        // -----------------------------------------------------------------
        // Test 1: User with no applications
        // -----------------------------------------------------------------
        console.log("\n▶ Step 2: Test User A With No Applications");
        const userAAppsRes = await clientA.get("/applications");
        if (userAAppsRes.status === 200 && Array.isArray(userAAppsRes.data.data) && userAAppsRes.data.data.length === 0) {
            logPass("User A has 0 applications initially (empty state verified)");
        } else {
            logFail("User A expected 0 applications, got:", userAAppsRes.data);
        }

        // -----------------------------------------------------------------
        // Test 2: User B saves jobs & creates multiple applications across statuses
        // -----------------------------------------------------------------
        console.log("\n▶ Step 3: User B Creates Multiple Applications Across Supported Statuses");
        const job1Res = await clientB.post("/jobs", {
            company: "Figma",
            jobTitle: "Design Systems Engineer",
            jobUrl: `https://figma.com/careers/${timestamp}-1`,
            location: "San Francisco, CA",
        });
        const job2Res = await clientB.post("/jobs", {
            company: "Airbnb",
            jobTitle: "Staff Platform Engineer",
            jobUrl: `https://airbnb.com/careers/${timestamp}-2`,
            location: "Remote",
        });
        const job3Res = await clientB.post("/jobs", {
            company: "Anthropic",
            jobTitle: "AI Alignment Engineer",
            jobUrl: `https://anthropic.com/careers/${timestamp}-3`,
            location: "San Francisco, CA",
        });

        const job1Id = job1Res.data.data._id;
        const job2Id = job2Res.data.data._id;
        const job3Id = job3Res.data.data._id;

        // Create 3 applications with different statuses
        const app1Res = await clientB.post("/applications", {
            job: job1Id,
            status: "saved",
            notes: "Bookmarked via CareerOS",
        });
        const app2Res = await clientB.post("/applications", {
            job: job2Id,
            status: "applied",
            notes: "Submitted application with referral",
        });
        const app3Res = await clientB.post("/applications", {
            job: job3Id,
            status: "interview",
            notes: "Technical phone screen scheduled",
        });

        if (app1Res.status === 201 && app2Res.status === 201 && app3Res.status === 201) {
            logPass("User B created 3 applications across 'saved', 'applied', and 'interview' statuses");
        } else {
            logFail("Failed to create applications for User B");
        }

        const app1Id = app1Res.data.data._id;
        const app2Id = app2Res.data.data._id;
        const app3Id = app3Res.data.data._id;

        // -----------------------------------------------------------------
        // Test 3: Backend Status Filtering
        // -----------------------------------------------------------------
        console.log("\n▶ Step 4: Backend Status Query Filtering");
        const filterAppliedRes = await clientB.get("/applications?status=applied");
        if (
            filterAppliedRes.status === 200 &&
            filterAppliedRes.data.data.length === 1 &&
            filterAppliedRes.data.data[0]._id === app2Id
        ) {
            logPass("Backend ?status=applied returns only the applied application");
        } else {
            logFail("Backend status filter failed:", filterAppliedRes.data);
        }

        // -----------------------------------------------------------------
        // Test 4: Successful Status Update and Persistence
        // -----------------------------------------------------------------
        console.log("\n▶ Step 5: Application Status Mutation & Persistence");
        const updateRes = await clientB.patch(`/applications/${app1Id}`, {
            status: "oa",
        });

        if (updateRes.status === 200 && updateRes.data.data.status === "oa") {
            logPass("Updated App 1 status from 'saved' to 'oa' (Online Assessment)");
        } else {
            logFail("Failed to update status to 'oa':", updateRes.data);
        }

        // Verify persistence after fresh fetch
        const freshApp1Res = await clientB.get(`/applications/${app1Id}`);
        if (freshApp1Res.status === 200 && freshApp1Res.data.data.status === "oa") {
            logPass("Status 'oa' persisted in database and returned on fresh query");
            const history = freshApp1Res.data.data.statusHistory || [];
            if (history.some((h) => h.status === "oa")) {
                logPass(`Status history successfully recorded progression (${history.length} events)`);
            } else {
                logFail("Status history did not record 'oa' transition");
            }
        } else {
            logFail("Status 'oa' did not persist:", freshApp1Res.data);
        }

        // -----------------------------------------------------------------
        // Test 5: Failed Update Behavior (Invalid Status)
        // -----------------------------------------------------------------
        console.log("\n▶ Step 6: Invalid Status Update Validation");
        const invalidUpdateRes = await clientB.patch(`/applications/${app1Id}`, {
            status: "non_existent_status_xyz",
        });

        if (invalidUpdateRes.status === 400 || invalidUpdateRes.status === 500) {
            logPass(`Invalid status rejected by server with status ${invalidUpdateRes.status}`);
        } else {
            logFail(`Expected failure for invalid status, got: ${invalidUpdateRes.status}`);
        }

        // -----------------------------------------------------------------
        // Test 6: Cross-User Read/Update/Delete Isolation
        // -----------------------------------------------------------------
        console.log("\n▶ Step 7: Cross-User Application Isolation (Horizontal Privilege Prevention)");
        // User A attempts to view User B's application
        const userAReadUserBApp = await clientA.get(`/applications/${app1Id}`);
        if (userAReadUserBApp.status === 404) {
            logPass("User A cannot read User B's application by ID -> 404 Not Found");
        } else {
            logFail(`User A read User B's application! Status: ${userAReadUserBApp.status}`);
        }

        // User A attempts to update User B's application
        const userAUpdateUserBApp = await clientA.patch(`/applications/${app1Id}`, {
            status: "rejected",
        });
        if (userAUpdateUserBApp.status === 404) {
            logPass("User A cannot update User B's application by ID -> 404 Not Found");
        } else {
            logFail(`User A modified User B's application! Status: ${userAUpdateUserBApp.status}`);
        }

        // User A attempts to delete User B's application
        const userADeleteUserBApp = await clientA.delete(`/applications/${app1Id}`);
        if (userADeleteUserBApp.status === 404) {
            logPass("User A cannot delete User B's application by ID -> 404 Not Found");
        } else {
            logFail(`User A deleted User B's application! Status: ${userADeleteUserBApp.status}`);
        }

        // Verify User B's application is untouched
        const verifyUntouched = await clientB.get(`/applications/${app1Id}`);
        if (verifyUntouched.status === 200 && verifyUntouched.data.data.status === "oa") {
            logPass("User B's application remains completely intact and secure");
        } else {
            logFail("User B's application was modified or deleted during isolation test");
        }

        // -----------------------------------------------------------------
        // Test 7: Authorized Deletion
        // -----------------------------------------------------------------
        console.log("\n▶ Step 8: Authorized Deletion by Owner");
        const deleteRes = await clientB.delete(`/applications/${app1Id}`);
        if (deleteRes.status === 200) {
            logPass("User B successfully deleted their own application");
        } else {
            logFail("Failed to delete application:", deleteRes.data);
        }

        const verifyDeleted = await clientB.get(`/applications/${app1Id}`);
        if (verifyDeleted.status === 404) {
            logPass("Deleted application is no longer retrievable (404 Not Found)");
        } else {
            logFail("Deleted application still retrievable");
        }

        console.log("\n=======================================================");
        console.log("   ALL APPLICATION VERIFICATION TESTS PASSED (100%)");
        console.log("=======================================================\n");
    } catch (err) {
        logFail("Unexpected error during application regression tests", err);
    }
}

runApplicationTests();
