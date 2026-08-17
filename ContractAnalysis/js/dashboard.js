const API_BASE = "http://127.0.0.1:5000";

let contractsChart = null;
let riskChart = null;


document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadDashboard();

        document
            .getElementById("periodSelect")
            .addEventListener(
                "change",
                loadDashboard
            );

    }
);


async function loadDashboard() {

    try {

        const response = await fetch(
            `${API_BASE}/dashboard`
        );

        if (!response.ok) {
            throw new Error(
                "Dashboard API Error"
            );
        }

        const data =
            await response.json();

        updateKPIs(data);

        createContractsChart(data);

        createRiskChart(data);

        updateContractsTable(data);

    }

    catch (error) {

        console.error(error);

        /*
         * لا نضع أرقام وهمية.
         * إذا الـ backend غير شغال
         * نخلي الـ Dashboard فاضي.
         */

        updateKPIs({
            totalContracts: 0,
            analyzedContracts: 0,
            highRisk: 0,
            mediumRisk: 0,
            lowRisk: 0,
            averageRisk: 0,
            totalClauses: 0,
            trend: [],
            recentContracts: []
        });

    }

}


/* ========================================
   KPIs
======================================== */

function updateKPIs(data) {

    document.getElementById(
        "totalContracts"
    ).textContent =
        data.totalContracts ?? 0;


    document.getElementById(
        "analyzedContracts"
    ).textContent =
        data.analyzedContracts ?? 0;


    document.getElementById(
        "highRisk"
    ).textContent =
        data.highRisk ?? 0;


    document.getElementById(
        "averageRisk"
    ).textContent =
        Math.round(
            data.averageRisk ?? 0
        );


    document.getElementById(
        "totalClauses"
    ).textContent =
        data.totalClauses ?? 0;

}


/* ========================================
   LINE CHART
======================================== */

function createContractsChart(data) {

    const trend =
        data.trend ?? [];


    const labels =
        trend.map(
            item => item.date
        );


    const uploaded =
        trend.map(
            item =>
                item.uploaded ??
                item.uploaded_count ??
                item.count ??
                0
        );


    const analyzed =
        trend.map(
            item =>
                item.analyzed ??
                item.analyzed_count ??
                0
        );


    const canvas =
        document.getElementById(
            "contractsChart"
        );


    if (contractsChart) {
        contractsChart.destroy();
    }


    contractsChart =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels: labels,

                    datasets: [

                        {
                            label:
                                "Contracts Uploaded",

                            data:
                                uploaded,

                            borderColor:
                                "#1767db",

                            backgroundColor:
                                "rgba(23,103,219,0.05)",

                            borderWidth: 2,

                            pointRadius: 3,

                            pointBackgroundColor:
                                "#1767db",

                            tension: 0.35,

                            fill: false
                        },


                        {
                            label:
                                "Contracts Analyzed",

                            data:
                                analyzed,

                            borderColor:
                                "#19aa6c",

                            backgroundColor:
                                "rgba(25,170,108,0.05)",

                            borderWidth: 2,

                            pointRadius: 3,

                            pointBackgroundColor:
                                "#19aa6c",

                            tension: 0.35,

                            fill: false
                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {
                                precision: 0
                            },

                            grid: {
                                color:
                                    "#e8edf3"
                            }

                        },

                        x: {

                            grid: {
                                display: false
                            }

                        }

                    }

                }

            }
        );

}


/* ========================================
   RISK CHART
======================================== */

function createRiskChart(data) {

    const high =
        data.highRisk ?? 0;

    const medium =
        data.mediumRisk ?? 0;

    const low =
        data.lowRisk ?? 0;


    const total =
        high + medium + low;


    const getPercentage =
        value => {

            if (!total) {
                return "0%";
            }

            return (
                (value / total * 100)
                .toFixed(1) + "%"
            );

        };


    document.getElementById(
        "highRiskSide"
    ).textContent = high;


    document.getElementById(
        "mediumRiskSide"
    ).textContent = medium;


    document.getElementById(
        "lowRiskSide"
    ).textContent = low;


    document.getElementById(
        "highPercentage"
    ).textContent =
        getPercentage(high);


    document.getElementById(
        "mediumPercentage"
    ).textContent =
        getPercentage(medium);


    document.getElementById(
        "lowPercentage"
    ).textContent =
        getPercentage(low);


    const canvas =
        document.getElementById(
            "riskChart"
        );


    if (riskChart) {
        riskChart.destroy();
    }


    riskChart =
        new Chart(
            canvas,
            {

                type: "doughnut",

                data: {

                    labels: [
                        "High Risk",
                        "Medium Risk",
                        "Low Risk"
                    ],

                    datasets: [

                        {

                            data: [
                                high,
                                medium,
                                low
                            ],

                            backgroundColor: [
                                "#ef4444",
                                "#f59e0b",
                                "#16a86b"
                            ],

                            borderWidth: 2,

                            borderColor:
                                "#ffffff"

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    cutout: "60%",

                    plugins: {

                        legend: {
                            display: false
                        }

                    }

                }

            }
        );

}


/* ========================================
   RECENT CONTRACTS
======================================== */

function updateContractsTable(data) {

    const contracts =
        data.recentContracts ?? [];


    const table =
        document.getElementById(
            "contractsTable"
        );


    if (!contracts.length) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="
                        text-align:center;
                        padding:25px;
                        color:#7b899c;
                    "
                >

                    No contracts available yet.

                </td>

            </tr>

        `;

        return;
    }


    table.innerHTML = "";


    contracts
        .slice(0, 5)
        .forEach(contract => {

            const risk =
                contract.risk ??
                "Low";


            let riskClass =
                "low";


            if (
                risk.toLowerCase()
                    === "high"
            ) {

                riskClass = "high";

            }

            else if (
                risk.toLowerCase()
                    === "medium"
            ) {

                riskClass = "medium";

            }


            const score =
                contract.score ?? 0;


            let scoreClass =
                "score-low";


            if (score >= 70) {
                scoreClass =
                    "score-high";
            }

            else if (score >= 40) {
                scoreClass =
                    "score-medium";
            }


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${
                        escapeHTML(
                            contract.name ??
                            contract.contract_name ??
                            "Unnamed Contract"
                        )
                    }
                </td>


                <td>

                    <span
                        class="status-badge"
                    >
                        ✓ Analyzed
                    </span>

                </td>


                <td>

                    <span
                        class="
                            risk-badge
                            ${riskClass}
                        "
                    >
                        ${risk}
                    </span>

                </td>


                <td>

                    <span
                        class="${scoreClass}"
                    >
                        ${score} /100
                    </span>

                </td>


                <td>
                    ${
                        contract.totalClauses ??
                        contract.total_clauses ??
                        0
                    }
                </td>


                <td>
                    ${
                        formatDate(
                            contract.createdAt ??
                            contract.created_at
                        )
                    }
                </td>


                <td>

                    <button
                        class="action-btn"
                        onclick="
                            viewContract(
                                '${contract.id ?? ""}'
                            )
                        "
                    >
                        ◉
                    </button>

                </td>

            `;


            table.appendChild(row);

        });

}


/* ========================================
   DATE
======================================== */

function formatDate(value) {

    if (!value) {
        return "—";
    }


    const date =
        new Date(value);


    if (isNaN(date)) {
        return value;
    }


    return date.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );

}


/* ========================================
   VIEW
======================================== */

function viewContract(id) {

    if (!id) {
        return;
    }


    window.location.href =
        `my-contracts.html?id=${id}`;

}


/* ========================================
   SECURITY
======================================== */

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}

