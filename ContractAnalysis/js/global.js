// ============================================================
// GROUPS.JS
// SANAD - Department Group Workspace
//
// The user's Department has priority.
// Job Title is used only if Department is not recognized.
// ============================================================


document.addEventListener("DOMContentLoaded", () => {

    loadUserGroup();

});


// ============================================================
// LOAD USER GROUP
// ============================================================

function loadUserGroup() {

    const profile = JSON.parse(
        localStorage.getItem("profile") || "{}"
    );

    console.log("SANAD Profile:", profile);

    const department = normalize(profile.department);
    const jobTitle = normalize(profile.jobTitle);

    let group = null;


    // --------------------------------------------------------
    // DEPARTMENT HAS PRIORITY
    // --------------------------------------------------------

    if (department) {

        group = getGroupFromDepartment(department);

    }


    // --------------------------------------------------------
    // JOB TITLE FALLBACK
    // --------------------------------------------------------

    if (!group && jobTitle) {

        group = getGroupFromJobTitle(jobTitle);

    }


    // --------------------------------------------------------
    // DISPLAY
    // --------------------------------------------------------

    if (group) {

        displayGroup(group, profile);

    } else {

        displayNoGroup();

    }

}


// ============================================================
// NORMALIZE TEXT
// ============================================================

function normalize(value) {

    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

}


// ============================================================
// DEPARTMENT → GROUP
// ============================================================

function getGroupFromDepartment(department) {


    if (
        department.includes("technical") ||
        department.includes("technology")
    ) {

        return createGroup(
            "Technical",
            "T",
            "technical"
        );

    }


    if (
        department.includes("legal") ||
        department.includes("law")
    ) {

        return createGroup(
            "Legal",
            "L",
            "legal"
        );

    }


    if (
        department.includes("administrative") ||
        department.includes("administration")
    ) {

        return createGroup(
            "Administrative",
            "A",
            "administrative"
        );

    }


    if (
        department.includes("contract")
    ) {

        return createGroup(
            "Contracts",
            "C",
            "contracts"
        );

    }


    if (
        department.includes("procurement") ||
        department.includes("purchasing") ||
        department.includes("supply chain")
    ) {

        return createGroup(
            "Procurement",
            "P",
            "procurement"
        );

    }


    if (
        department.includes("finance") ||
        department.includes("financial") ||
        department.includes("accounting") ||
        department.includes("accounts")
    ) {

        return createGroup(
            "Finance",
            "F",
            "finance"
        );

    }


    if (
        department.includes("operations") ||
        department.includes("operation")
    ) {

        return createGroup(
            "Operations",
            "O",
            "operations"
        );

    }


    if (
        department.includes("hse") ||
        department.includes("health") ||
        department.includes("safety") ||
        department.includes("environment")
    ) {

        return createGroup(
            "HSE",
            "H",
            "hse"
        );

    }


    if (
        department.includes("human resources") ||
        department.includes("human resource") ||
        department === "hr"
    ) {

        return createGroup(
            "Human Resources",
            "HR",
            "hr"
        );

    }


    if (
        department.includes("information technology") ||
        department.includes("information tech") ||
        department === "it"
    ) {

        return createGroup(
            "Information Technology",
            "IT",
            "it"
        );

    }


    if (
        department.includes("engineering") ||
        department.includes("engineer")
    ) {

        return createGroup(
            "Engineering",
            "E",
            "engineering"
        );

    }


    if (
        department.includes("commercial")
    ) {

        return createGroup(
            "Commercial",
            "C",
            "commercial"
        );

    }


    if (
        department.includes("management") ||
        department.includes("executive")
    ) {

        return createGroup(
            "Management",
            "M",
            "management"
        );

    }


    return null;

}


// ============================================================
// JOB TITLE → GROUP
// ============================================================

function getGroupFromJobTitle(jobTitle) {


    if (
        jobTitle.includes("procurement") ||
        jobTitle.includes("purchasing") ||
        jobTitle.includes("buyer") ||
        jobTitle.includes("sourcing")
    ) {

        return createGroup(
            "Procurement",
            "P",
            "procurement"
        );

    }


    if (
        jobTitle.includes("legal") ||
        jobTitle.includes("lawyer") ||
        jobTitle.includes("attorney") ||
        jobTitle.includes("counsel")
    ) {

        return createGroup(
            "Legal",
            "L",
            "legal"
        );

    }


    if (
        jobTitle.includes("finance") ||
        jobTitle.includes("financial") ||
        jobTitle.includes("accountant") ||
        jobTitle.includes("accounting")
    ) {

        return createGroup(
            "Finance",
            "F",
            "finance"
        );

    }


    if (
        jobTitle.includes("technical") ||
        jobTitle.includes("technician") ||
        jobTitle.includes("technology")
    ) {

        return createGroup(
            "Technical",
            "T",
            "technical"
        );

    }


    if (
        jobTitle.includes("contract") ||
        jobTitle.includes("contract specialist") ||
        jobTitle.includes("contract administrator")
    ) {

        return createGroup(
            "Contracts",
            "C",
            "contracts"
        );

    }


    if (
        jobTitle.includes("operations") ||
        jobTitle.includes("operation")
    ) {

        return createGroup(
            "Operations",
            "O",
            "operations"
        );

    }


    if (
        jobTitle.includes("hse") ||
        jobTitle.includes("safety") ||
        jobTitle.includes("environment")
    ) {

        return createGroup(
            "HSE",
            "H",
            "hse"
        );

    }


    if (
        jobTitle.includes("engineer") ||
        jobTitle.includes("engineering")
    ) {

        return createGroup(
            "Engineering",
            "E",
            "engineering"
        );

    }


    if (
        jobTitle.includes("manager") ||
        jobTitle.includes("director") ||
        jobTitle.includes("executive")
    ) {

        return createGroup(
            "Management",
            "M",
            "management"
        );

    }


    return null;

}


// ============================================================
// CREATE GROUP OBJECT
// ============================================================

function createGroup(
    name,
    icon,
    key
) {

    return {

        name: name,

        icon: icon,

        key: key,

        description:
            `Your workspace is dedicated to the ${name} Department.`,

        dashboard:
            `group-dashboard.html?group=${key}`

    };

}


// ============================================================
// DISPLAY GROUP
// ============================================================

function displayGroup(group, profile) {


    const groupTitle =
        document.getElementById("groupTitle");


    const groupName =
        document.getElementById("groupName");


    const groupIcon =
        document.getElementById("groupIcon");


    const groupDescription =
        document.getElementById("groupDescription");


    const jobTitleDisplay =
        document.getElementById("jobTitleDisplay");


    const noGroupMessage =
        document.getElementById("noGroupMessage");


    const groupsGrid =
        document.querySelector(".groups-grid");


    // --------------------------------------------------------
    // SHOW CONTENT
    // --------------------------------------------------------

    if (groupsGrid) {

        groupsGrid.style.display = "block";

    }


    if (noGroupMessage) {

        noGroupMessage.style.display = "none";

    }


    // --------------------------------------------------------
    // WELCOME TITLE
    // --------------------------------------------------------

    if (groupTitle) {

        groupTitle.textContent =
            `Welcome to the ${group.name} Department Group`;

    }


    // --------------------------------------------------------
    // GROUP NAME
    // --------------------------------------------------------

    if (groupName) {

        groupName.textContent =
            `${group.name} Group`;

    }


    // --------------------------------------------------------
    // GROUP ICON
    // --------------------------------------------------------

    if (groupIcon) {

        groupIcon.textContent =
            group.icon;

    }


    // --------------------------------------------------------
    // DESCRIPTION
    // --------------------------------------------------------

    if (groupDescription) {

        groupDescription.textContent =
            `Welcome to the ${group.name} Department workspace.`;

    }


    // --------------------------------------------------------
    // JOB TITLE
    // --------------------------------------------------------

    if (jobTitleDisplay) {

        const jobTitle =
            profile.jobTitle || "Not specified";


        jobTitleDisplay.innerHTML =
            `<strong>Job Title:</strong> ${escapeHTML(jobTitle)}`;

    }

}


// ============================================================
// NO GROUP
// ============================================================

function displayNoGroup() {


    const groupsGrid =
        document.querySelector(".groups-grid");


    const noGroupMessage =
        document.getElementById("noGroupMessage");


    if (groupsGrid) {

        groupsGrid.style.display =
            "none";

    }


    if (noGroupMessage) {

        noGroupMessage.style.display =
            "block";

    }

}


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHTML(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}

