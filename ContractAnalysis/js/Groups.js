/* =========================================
   GROUPS PAGE
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadCurrentUser();

    setupContractUpload();

});


/* =========================================
   LOAD CURRENT USER
========================================= */

function loadCurrentUser() {

    /*
        We try several common storage keys
        so the page can work with the existing
        login/settings system.
    */

    let user = null;

    const possibleKeys = [
        "currentUser",
        "user",
        "userData",
        "loggedInUser",
        "sanadUser"
    ];


    for (const key of possibleKeys) {

        const stored = localStorage.getItem(key);

        if (stored) {

            try {

                user = JSON.parse(stored);

                if (user) {
                    break;
                }

            } catch (error) {

                /*
                    If the stored value is just a name
                */

                user = {
                    full_name: stored
                };

                break;
            }
        }
    }


    /*
        If nothing was found,
        try individual localStorage values.
    */

    if (!user) {

        user = {

            full_name:
                localStorage.getItem("full_name") ||
                localStorage.getItem("name") ||
                localStorage.getItem("username") ||
                "",

            department:
                localStorage.getItem("department") ||
                "",

            job_title:
                localStorage.getItem("job_title") ||
                localStorage.getItem("jobTitle") ||
                ""

        };
    }


    updateHeader(user);

    updateDepartment(user);
}


/* =========================================
   HEADER
========================================= */

function updateHeader(user) {

    const userName = document.getElementById("userName");
    const userAvatar = document.getElementById("userAvatar");


    const name =
        user.full_name ||
        user.fullName ||
        user.name ||
        user.username ||
        "User";


    userName.textContent = name;


    /*
        Generate initials
    */

    const words = name.trim().split(/\s+/);

    let initials = "U";


    if (words.length >= 2) {

        initials =
            words[0].charAt(0) +
            words[words.length - 1].charAt(0);

    } else if (words.length === 1) {

        initials =
            words[0].substring(0, 2);

    }


    userAvatar.textContent =
        initials.toUpperCase();
}


/* =========================================
   DEPARTMENT
========================================= */

function updateDepartment(user) {

    const department =
        user.department ||
        user.Department ||
        user.department_name ||
        user.departmentName ||
        localStorage.getItem("department") ||
        "";


    const workspace =
        document.getElementById("departmentWorkspace");

    const noDepartment =
        document.getElementById("noDepartmentCard");


    /*
        NO DEPARTMENT
    */

    if (!department || department.trim() === "") {

        workspace.classList.add("hidden");

        noDepartment.style.display = "flex";

        return;
    }


    /*
        DEPARTMENT EXISTS
    */

    workspace.classList.remove("hidden");

    noDepartment.style.display = "none";


    const cleanDepartment =
        formatDepartment(department);


    document.getElementById(
        "workspaceTitle"
    ).textContent =
        `Welcome to the ${cleanDepartment} Group`;


    document.getElementById(
        "workspaceDescription"
    ).textContent =
        `Welcome to the ${cleanDepartment} department workspace.`;


    document.getElementById(
        "departmentName"
    ).textContent =
        `${cleanDepartment} Department`;


    document.getElementById(
        "departmentDescription"
    ).textContent =
        `Manage contracts and AI insights for the ${cleanDepartment} department.`;


    document.getElementById(
        "departmentBadge"
    ).textContent =
        cleanDepartment.toUpperCase();


    document.getElementById(
        "userDepartment"
    ).textContent =
        cleanDepartment;


    /*
        USER NAME
    */

    const name =
        user.full_name ||
        user.fullName ||
        user.name ||
        user.username ||
        "—";


    document.getElementById(
        "employeeName"
    ).textContent = name;


    /*
        JOB TITLE
    */

    const jobTitle =
        user.job_title ||
        user.jobTitle ||
        user.title ||
        "—";


    document.getElementById(
        "userJobTitle"
    ).textContent =
        jobTitle;
}


/* =========================================
   FORMAT DEPARTMENT
========================================= */

function formatDepartment(value) {

    const text =
        value
            .toString()
            .trim();


    const departmentNames = {

        "technical":
            "Technical",

        "technical group":
            "Technical",

        "it":
            "IT",

        "information technology":
            "Information Technology",

        "finance":
            "Finance",

        "financial":
            "Finance",

        "hr":
            "Human Resources",

        "human resources":
            "Human Resources",

        "legal":
            "Legal",

        "procurement":
            "Procurement",

        "purchasing":
            "Procurement",

        "operations":
            "Operations",

        "engineering":
            "Engineering",

        "project management":
            "Project Management",

        "quality":
            "Quality",

        "safety":
            "Safety"

    };


    const key =
        text.toLowerCase();


    return departmentNames[key] ||
        text;
}


/* =========================================
   CONTRACT UPLOAD
========================================= */

function setupContractUpload() {

    const fileInput =
        document.getElementById("contractFile");

    const selectedFile =
        document.getElementById("selectedFile");

    const fileName =
        document.getElementById("fileName");

    const fileSize =
        document.getElementById("fileSize");

    const removeFile =
        document.getElementById("removeFile");

    const analyzeButton =
        document.getElementById("analyzeButton");

    const uploadStatus =
        document.getElementById("uploadStatus");


    let selected = null;


    /* =====================================
       SELECT FILE
    ====================================== */

    fileInput.addEventListener(
        "change",
        () => {

            if (!fileInput.files.length) {
                return;
            }


            const file =
                fileInput.files[0];


            /*
                PDF ONLY
            */

            if (
                file.type !== "application/pdf" &&
                !file.name.toLowerCase().endsWith(".pdf")
            ) {

                uploadStatus.textContent =
                    "Please select a PDF contract.";

                uploadStatus.className =
                    "upload-status error";

                fileInput.value = "";

                return;
            }


            /*
                10 MB LIMIT
            */

            if (file.size > 10 * 1024 * 1024) {

                uploadStatus.textContent =
                    "File size must not exceed 10 MB.";

                uploadStatus.className =
                    "upload-status error";

                fileInput.value = "";

                return;
            }


            selected = file;


            fileName.textContent =
                file.name;


            fileSize.textContent =
                formatFileSize(file.size);


            selectedFile.style.display =
                "flex";


            uploadStatus.textContent = "";

            uploadStatus.className =
                "upload-status";
        }
    );


    /* =====================================
       REMOVE
    ====================================== */

    removeFile.addEventListener(
        "click",
        () => {

            selected = null;

            fileInput.value = "";

            selectedFile.style.display =
                "none";

            uploadStatus.textContent = "";

        }
    );


    /* =====================================
       ANALYZE
    ====================================== */

    analyzeButton.addEventListener(
        "click",
        async () => {

            if (!selected) {

                uploadStatus.textContent =
                    "Please select a contract first.";

                uploadStatus.className =
                    "upload-status error";

                return;
            }


            uploadStatus.textContent =
                "Uploading and analyzing contract...";

            uploadStatus.className =
                "upload-status";


            analyzeButton.disabled = true;

            analyzeButton.textContent =
                "Analyzing...";


            try {

                const formData =
                    new FormData();


                formData.append(
                    "file",
                    selected
                );


                /*
                    Existing SANAD backend endpoint
                */

                const response =
                    await fetch(
                        "http://127.0.0.1:5000/contracts",
                        {
                            method: "POST",
                            body: formData
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        data.error ||
                        "Upload failed."
                    );
                }


                uploadStatus.textContent =
                    "Contract uploaded and analyzed successfully.";

                uploadStatus.className =
                    "upload-status success";


                /*
                    Go to My Contracts
                */

                setTimeout(() => {

                    window.location.href =
                        "my-contracts.html";

                }, 1200);


            } catch (error) {

                console.error(error);


                uploadStatus.textContent =
                    "Could not analyze the contract. Please make sure the backend is running.";

                uploadStatus.className =
                    "upload-status error";

            }


            analyzeButton.disabled = false;

            analyzeButton.textContent =
                "Analyze Contract →";

        }
    );
}


/* =========================================
   FILE SIZE
========================================= */

function formatFileSize(bytes) {

    if (bytes < 1024) {

        return bytes + " B";
    }


    if (bytes < 1024 * 1024) {

        return (
            (bytes / 1024).toFixed(1)
            + " KB"
        );
    }


    return (
        (bytes / (1024 * 1024)).toFixed(1)
        + " MB"
    );
}

