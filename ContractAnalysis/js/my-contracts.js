// ============================================================
// SANAD - MY CONTRACTS
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {


        // ====================================================
        // CONFIGURATION
        // ====================================================

        const API_URL =
            "/contracts";


        const REFRESH_INTERVAL =
            5000;


        // ====================================================
        // GET CURRENT USER
        // ====================================================

        function getCurrentUser() {

            const possibleKeys = [
                "sanadUser",
                "currentUser",
                "user",
                "loggedInUser"
            ];


            for (const key of possibleKeys) {

                const saved =
                    localStorage.getItem(key);


                if (!saved) {
                    continue;
                }


                try {

                    const user =
                        JSON.parse(saved);


                    if (
                        user &&
                        user.id
                    ) {

                        return user;

                    }

                } catch (error) {

                    console.error(
                        "User parsing error:",
                        error
                    );

                }

            }


            return null;

        }


        const currentUser =
            getCurrentUser();


        // ====================================================
        // FIND CONTRACT CONTAINER
        // ====================================================

        function findContractsContainer() {

            const selectors = [

                "#contractsList",

                "#contractsContainer",

                ".contracts-list",

                ".contracts-container",

                ".my-contracts-list",

                ".contracts-grid",

                "[data-contracts-list]"

            ];


            for (
                const selector
                of selectors
            ) {

                const element =
                    document.querySelector(
                        selector
                    );


                if (element) {

                    return element;

                }

            }


            return null;

        }


        let contractsContainer =
            findContractsContainer();


        // ====================================================
        // IF USER IS NOT FOUND
        // ====================================================

        if (
            !currentUser ||
            !currentUser.id
        ) {

            console.error(
                "SANAD user not found in localStorage."
            );


            if (contractsContainer) {

                contractsContainer.innerHTML = `

                    <div class="contracts-empty">

                        <h3>
                            Login required
                        </h3>

                        <p>
                            Please log in again to view your contracts.
                        </p>

                    </div>

                `;

            }


            return;

        }


        // ====================================================
        // LOADING
        // ====================================================

        if (contractsContainer) {

            contractsContainer.innerHTML = `

                <div class="contracts-loading">

                    <div class="contracts-spinner"></div>

                    <p>
                        Loading your contracts...
                    </p>

                </div>

            `;

        }


        // ====================================================
        // LOAD CONTRACTS
        // ====================================================

        async function loadContracts(
            showLoading = false
        ) {

            if (!contractsContainer) {

                contractsContainer =
                    findContractsContainer();

            }


            if (!contractsContainer) {

                console.error(
                    "Could not find the contracts container."
                );

                return;

            }


            if (
                showLoading &&
                contractsContainer
            ) {

                contractsContainer.innerHTML = `

                    <div class="contracts-loading">

                        <div class="contracts-spinner"></div>

                        <p>
                            Loading your contracts...
                        </p>

                    </div>

                `;

            }


            try {

                const response =
                    await fetch(
                        `${API_URL}?user_id=${encodeURIComponent(currentUser.id)}`,
                        {
                            method: "GET",
                            headers: {
                                "Accept":
                                    "application/json"
                            }
                        }
                    );


                let result = {};


                try {

                    result =
                        await response.json();

                } catch (error) {

                    result = {};

                }


                if (!response.ok) {

                    throw new Error(
                        result.error ||
                        "Could not load contracts."
                    );

                }


                const contracts =
                    Array.isArray(
                        result.contracts
                    )
                        ? result.contracts
                        : [];


                renderContracts(
                    contracts
                );


            } catch (error) {

                console.error(
                    "Load contracts error:",
                    error
                );


                if (
                    !contractsContainer
                ) {
                    return;
                }


                contractsContainer.innerHTML = `

                    <div class="contracts-empty">

                        <h3>
                            Unable to load contracts
                        </h3>

                        <p>
                            ${escapeHtml(
                                error.message ||
                                "Something went wrong."
                            )}
                        </p>


                        <button
                            type="button"
                            id="retryContracts"
                            class="retry-contracts-button"
                        >
                            Try Again
                        </button>

                    </div>

                `;


                const retryButton =
                    document.getElementById(
                        "retryContracts"
                    );


                if (retryButton) {

                    retryButton.addEventListener(
                        "click",
                        () => {

                            loadContracts(
                                true
                            );

                        }
                    );

                }

            }

        }


        // ====================================================
        // RENDER CONTRACTS
        // ====================================================

        function renderContracts(
            contracts
        ) {

            if (!contractsContainer) {
                return;
            }


            // ------------------------------------------------
            // EMPTY
            // ------------------------------------------------

            if (
                !contracts ||
                contracts.length === 0
            ) {

                contractsContainer.innerHTML = `

                    <div class="contracts-empty">

                        <div class="empty-icon">
                            PDF
                        </div>

                        <h3>
                            No contracts yet
                        </h3>

                        <p>
                            Upload your first contract
                            to start the AI analysis.
                        </p>


                        <a
                            href="upload-contract.html"
                            class="upload-first-contract"
                        >
                            Upload Contract
                        </a>

                    </div>

                `;


                return;

            }


            // ------------------------------------------------
            // CONTRACTS
            // ------------------------------------------------

            contractsContainer.innerHTML =
                contracts
                    .map(
                        contract =>
                            createContractHTML(
                                contract
                            )
                    )
                    .join("");


            attachContractEvents();

        }


        // ====================================================
        // CREATE CONTRACT HTML
        // ====================================================

        function createContractHTML(
            contract
        ) {

            const status =
                getStatus(
                    contract
                );


            const statusClass =
                getStatusClass(
                    status
                );


            const statusText =
                getStatusText(
                    status
                );


            const isAnalyzing =
                isAnalysisInProgress(
                    status
                );


            const risk =
                contract.risk ||
                "Pending";


            const score =
                contract.score !== undefined &&
                contract.score !== null
                    ? contract.score
                    : 0;


            const completeness =
                contract.completeness !== undefined &&
                contract.completeness !== null
                    ? contract.completeness
                    : 0;


            const createdAt =
                formatDate(
                    contract.created_at
                );


            const fileName =
                contract.name ||
                "Untitled Contract";


            return `

                <div
                    class="contract-card"
                    data-contract-id="${escapeHtml(
                        contract.id
                    )}"
                >

                    <div class="contract-card-top">

                        <div class="contract-file-icon">
                            PDF
                        </div>


                        <div class="contract-info">

                            <h3
                                title="${escapeHtml(
                                    fileName
                                )}"
                            >
                                ${escapeHtml(
                                    fileName
                                )}
                            </h3>


                            <span class="contract-date">
                                ${escapeHtml(
                                    createdAt
                                )}
                            </span>

                        </div>


                        <span
                            class="contract-status ${statusClass}"
                        >
                            ${statusText}
                        </span>

                    </div>


                    ${
                        isAnalyzing
                            ? `

                        <div class="contract-analysis-progress">

                            <div class="analysis-spinner"></div>

                            <div>

                                <strong>
                                    AI analysis in progress
                                </strong>

                                <p>
                                    Your contract has been uploaded
                                    successfully. The AI is analyzing
                                    its terms and risks. Please wait.
                                </p>

                            </div>

                        </div>

                    `
                            : ""
                    }


                    ${
                        status === "Analysis Failed"
                            ? `

                        <div class="contract-analysis-failed">

                            <strong>
                                Analysis could not be completed
                            </strong>

                            <p>
                                Please try uploading the contract again.
                            </p>

                        </div>

                    `
                            : ""
                    }


                    ${
                        !isAnalyzing &&
                        status !== "Analysis Failed"
                            ? `

                        <div class="contract-details">

                            <div class="contract-detail">

                                <span>
                                    Risk
                                </span>

                                <strong>
                                    ${escapeHtml(
                                        String(risk)
                                    )}
                                </strong>

                            </div>


                            <div class="contract-detail">

                                <span>
                                    Score
                                </span>

                                <strong>
                                    ${escapeHtml(
                                        String(score)
                                    )}
                                </strong>

                            </div>


                            <div class="contract-detail">

                                <span>
                                    Completeness
                                </span>

                                <strong>
                                    ${escapeHtml(
                                        String(completeness)
                                    )}
                                </strong>

                            </div>

                        </div>

                    `
                            : ""
                    }


                    <div class="contract-actions">

                        ${
                            isAnalyzing
                                ? `

                                <button
                                    type="button"
                                    class="contract-view-button disabled"
                                    disabled
                                >
                                    Analysis in progress
                                </button>

                            `
                                : status === "Analysis Failed"
                                    ? `

                                <button
                                    type="button"
                                    class="contract-delete-button"
                                    data-contract-id="${escapeHtml(
                                        contract.id
                                    )}"
                                >
                                    Delete
                                </button>

                            `
                                    : `

                                <button
                                    type="button"
                                    class="contract-view-button"
                                    data-contract-id="${escapeHtml(
                                        contract.id
                                    )}"
                                >
                                    View Contract
                                </button>


                                <button
                                    type="button"
                                    class="contract-delete-button"
                                    data-contract-id="${escapeHtml(
                                        contract.id
                                    )}"
                                >
                                    Delete
                                </button>

                            `

                        }

                    </div>

                </div>

            `;

        }


        // ====================================================
        // STATUS
        // ====================================================

        function getStatus(
            contract
        ) {

            return (
                contract.analysis_status ||
                contract.status ||
                "Analyzing"
            );

        }


        // ====================================================
        // STATUS CLASS
        // ====================================================

        function getStatusClass(
            status
        ) {

            const normalized =
                String(status)
                    .toLowerCase();


            if (
                normalized.includes(
                    "analy"
                ) &&
                !normalized.includes(
                    "failed"
                )
            ) {

                return "status-analyzing";

            }


            if (
                normalized.includes(
                    "failed"
                )
            ) {

                return "status-failed";

            }


            if (
                normalized.includes(
                    "complete"
                ) ||
                normalized.includes(
                    "analyzed"
                )
            ) {

                return "status-analyzed";

            }


            return "status-pending";

        }


        // ====================================================
        // STATUS TEXT
        // ====================================================

        function getStatusText(
            status
        ) {

            const normalized =
                String(status)
                    .toLowerCase();


            if (
                normalized.includes(
                    "failed"
                )
            ) {

                return "Analysis Failed";

            }


            if (
                normalized.includes(
                    "analy"
                )
            ) {

                return "Analyzing...";

            }


            if (
                normalized.includes(
                    "analyzed"
                ) ||
                normalized.includes(
                    "complete"
                )
            ) {

                return "Analyzed";

            }


            return String(status);

        }


        // ====================================================
        // CHECK ANALYSIS PROGRESS
        // ====================================================

        function isAnalysisInProgress(
            status
        ) {

            const normalized =
                String(status)
                    .toLowerCase();


            return (
                normalized.includes(
                    "analy"
                ) &&
                !normalized.includes(
                    "failed"
                )
            );

        }


        // ====================================================
        // ATTACH BUTTON EVENTS
        // ====================================================

        function attachContractEvents() {

            // ------------------------------------------------
            // VIEW
            // ------------------------------------------------

            const viewButtons =
                document.querySelectorAll(
                    ".contract-view-button:not(.disabled)"
                );


            viewButtons.forEach(
                button => {

                    button.addEventListener(
                        "click",
                        function () {

                            const id =
                                this.dataset.contractId;


                            if (!id) {
                                return;
                            }


                            // Keep this URL compatible with
                            // your existing contract page.

                            window.location.href =
                                `contract-details.html?id=${encodeURIComponent(
                                    id
                                )}`;

                        }
                    );

                }
            );


            // ------------------------------------------------
            // DELETE
            // ------------------------------------------------

            const deleteButtons =
                document.querySelectorAll(
                    ".contract-delete-button"
                );


            deleteButtons.forEach(
                button => {

                    button.addEventListener(
                        "click",
                        async function () {

                            const id =
                                this.dataset.contractId;


                            if (!id) {
                                return;
                            }


                            const confirmed =
                                window.confirm(
                                    "Are you sure you want to delete this contract?"
                                );


                            if (!confirmed) {
                                return;
                            }


                            await deleteContract(
                                id
                            );

                        }
                    );

                }
            );

        }


        // ====================================================
        // DELETE CONTRACT
        // ====================================================

        async function deleteContract(
            contractId
        ) {

            try {

                const response =
                    await fetch(
                        `${API_URL}/${encodeURIComponent(
                            contractId
                        )}`,
                        {
                            method: "DELETE"
                        }
                    );


                let result = {};


                try {

                    result =
                        await response.json();

                } catch (error) {

                    result = {};

                }


                if (!response.ok) {

                    throw new Error(
                        result.error ||
                        "Could not delete the contract."
                    );

                }


                await loadContracts(
                    false
                );


            } catch (error) {

                console.error(
                    "Delete error:",
                    error
                );


                alert(
                    error.message ||
                    "Could not delete the contract."
                );

            }

        }


        // ====================================================
        // FORMAT DATE
        // ====================================================

        function formatDate(
            dateValue
        ) {

            if (!dateValue) {

                return "Recently uploaded";

            }


            try {

                const date =
                    new Date(
                        dateValue
                    );


                if (
                    Number.isNaN(
                        date.getTime()
                    )
                ) {

                    return "Recently uploaded";

                }


                return date.toLocaleDateString(
                    "en-US",
                    {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                    }
                );

            } catch (error) {

                return "Recently uploaded";

            }

        }


        // ====================================================
        // ESCAPE HTML
        // ====================================================

        function escapeHtml(
            value
        ) {

            const div =
                document.createElement(
                    "div"
                );


            div.textContent =
                value === null ||
                value === undefined
                    ? ""
                    : String(value);


            return div.innerHTML;

        }


        // ====================================================
        // START
        // ====================================================

        loadContracts(
            true
        );


        // ====================================================
        // AUTO REFRESH
        //
        // This is what makes:
        //
        // Analyzing...
        //
        // become:
        //
        // Analyzed
        //
        // automatically.
        // ====================================================

        setInterval(
            async () => {

                await loadContracts(
                    false
                );

            },
            REFRESH_INTERVAL
        );

    }
);