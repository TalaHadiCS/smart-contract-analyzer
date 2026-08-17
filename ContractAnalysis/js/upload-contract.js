// ============================================================
// SANAD - UPLOAD CONTRACT
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    // ========================================================
    // ELEMENTS
    // ========================================================

    const fileInput =
        document.getElementById("fileInput");

    const dropZone =
        document.getElementById("dropZone");

    const filePreview =
        document.getElementById("filePreview");


    // ========================================================
    // GET CURRENT USER
    // ========================================================

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
                    "Could not read user:",
                    error
                );

            }

        }


        return null;

    }


    // ========================================================
    // CREATE POPUP
    //
    // We create it automatically so the HTML page does not
    // need to be changed.
    // ========================================================

    function createSuccessPopup() {

        let popup =
            document.getElementById(
                "uploadSuccessPopup"
            );


        if (popup) {

            return popup;

        }


        popup =
            document.createElement("div");


        popup.id =
            "uploadSuccessPopup";


        popup.className =
            "upload-popup-overlay";


        popup.innerHTML = `

            <div class="upload-success-popup">

                <button
                    type="button"
                    class="popup-close"
                    id="popupClose"
                    aria-label="Close"
                >
                    ×
                </button>


                <div class="popup-success-icon">
                    ✓
                </div>


                <h2>
                    File Uploaded Successfully
                </h2>


                <p
                    class="popup-file-name"
                    id="popupFileName"
                ></p>


                <div class="popup-divider"></div>


                <div class="popup-analysis-status">

                    <div class="popup-loading">

                        <div class="popup-spinner"></div>

                    </div>


                    <div class="popup-analysis-text">

                        <strong>
                            AI analysis is in progress
                        </strong>

                        <p>
                            Your contract has been uploaded
                            successfully and is now being
                            analyzed by artificial intelligence.
                            This may take some time.
                            Please wait.
                        </p>

                    </div>

                </div>


                <button
                    type="button"
                    class="popup-contracts-button"
                    id="goToContractsButton"
                >
                    Go to My Contracts
                </button>


                <p class="popup-note">
                    You can view the analysis status
                    and your previous contracts in
                    My Contracts.
                </p>

            </div>

        `;


        document.body.appendChild(
            popup
        );


        return popup;

    }


    const popup =
        createSuccessPopup();


    const popupClose =
        document.getElementById(
            "popupClose"
        );


    const popupFileName =
        document.getElementById(
            "popupFileName"
        );


    const goToContractsButton =
        document.getElementById(
            "goToContractsButton"
        );


    // ========================================================
    // FILE INPUT
    // ========================================================

    if (fileInput) {

        fileInput.addEventListener(
            "change",
            function () {

                if (
                    this.files &&
                    this.files.length > 0
                ) {

                    handleSelectedFile(
                        this.files[0]
                    );

                }

            }
        );

    }


    // ========================================================
    // DRAG OVER
    // ========================================================

    if (dropZone) {

        dropZone.addEventListener(
            "dragover",
            function (event) {

                event.preventDefault();

                dropZone.classList.add(
                    "dragging"
                );

            }
        );


        // ====================================================
        // DRAG LEAVE
        // ====================================================

        dropZone.addEventListener(
            "dragleave",
            function () {

                dropZone.classList.remove(
                    "dragging"
                );

            }
        );


        // ====================================================
        // DROP
        // ====================================================

        dropZone.addEventListener(
            "drop",
            function (event) {

                event.preventDefault();

                dropZone.classList.remove(
                    "dragging"
                );


                const files =
                    event.dataTransfer.files;


                if (
                    files &&
                    files.length > 0
                ) {

                    handleSelectedFile(
                        files[0]
                    );

                }

            }
        );

    }


    // ========================================================
    // HANDLE SELECTED FILE
    // ========================================================

    function handleSelectedFile(file) {

        // ----------------------------------------------------
        // PDF CHECK
        // ----------------------------------------------------

        if (
            file.type !== "application/pdf" &&
            !file.name
                .toLowerCase()
                .endsWith(".pdf")
        ) {

            showUploadError(
                "Please upload a PDF file."
            );

            return;

        }


        // ----------------------------------------------------
        // FILE SIZE
        // ----------------------------------------------------

        const maxSize =
            50 * 1024 * 1024;


        if (
            file.size > maxSize
        ) {

            showUploadError(
                "The file size must be less than 50 MB."
            );

            return;

        }


        // ----------------------------------------------------
        // SHOW PREVIEW
        // ----------------------------------------------------

        showFilePreview(
            file
        );


        // ----------------------------------------------------
        // UPLOAD
        // ----------------------------------------------------

        uploadContract(
            file
        );

    }


    // ========================================================
    // SHOW FILE PREVIEW
    // ========================================================

    function showFilePreview(file) {

        if (!filePreview) {
            return;
        }


        const fileSize =
            formatFileSize(
                file.size
            );


        filePreview.innerHTML = `

            <div class="selected-file">

                <div class="file-row">

                    <div class="file-icon">
                        PDF
                    </div>


                    <div class="file-details">

                        <strong>
                            ${escapeHtml(file.name)}
                        </strong>

                        <span>
                            ${fileSize}
                        </span>

                    </div>


                    <button
                        type="button"
                        class="remove-file"
                        id="removeSelectedFile"
                        aria-label="Remove file"
                    >
                        ×
                    </button>

                </div>


                <div class="upload-status">
                    Uploading...
                </div>

            </div>

        `;


        const removeButton =
            document.getElementById(
                "removeSelectedFile"
            );


        if (removeButton) {

            removeButton.addEventListener(
                "click",
                function () {

                    if (fileInput) {

                        fileInput.value =
                            "";

                    }


                    filePreview.innerHTML =
                        "";

                }
            );

        }

    }


    // ========================================================
    // UPLOAD CONTRACT
    // ========================================================

    async function uploadContract(file) {

        const user =
            getCurrentUser();


        // ====================================================
        // USER CHECK
        // ====================================================

        if (!user || !user.id) {

            updateUploadStatus(
                "Upload Failed"
            );


            showUploadError(
                "Your login session could not be found. Please log in again."
            );


            return;

        }


        try {

            // ------------------------------------------------
            // FORM DATA
            // ------------------------------------------------

            const formData =
                new FormData();


            formData.append(
                "file",
                file
            );


            // IMPORTANT:
            // Flask requires this value.

            formData.append(
                "user_id",
                user.id
            );


            // ------------------------------------------------
            // SEND TO FLASK
            // ------------------------------------------------

            const response =
                await fetch(
                    "/contracts",
                    {
                        method: "POST",
                        body: formData
                    }
                );


            // ------------------------------------------------
            // READ RESPONSE
            // ------------------------------------------------

            let result = {};


            try {

                result =
                    await response.json();

            } catch (error) {

                result = {};

            }


            // ------------------------------------------------
            // ERROR
            // ------------------------------------------------

            if (!response.ok) {

                throw new Error(
                    result.error ||
                    result.message ||
                    "Failed to upload the contract."
                );

            }


            // ------------------------------------------------
            // SUCCESS
            // ------------------------------------------------

            updateUploadStatus(
                "Uploaded Successfully"
            );


            // ------------------------------------------------
            // SHOW POPUP
            // ------------------------------------------------

            showSuccessPopup(
                file.name
            );


        } catch (error) {

            console.error(
                "Upload Error:",
                error
            );


            updateUploadStatus(
                "Upload Failed"
            );


            showUploadError(
                error.message ||
                "Something went wrong while uploading the contract."
            );

        }

    }


    // ========================================================
    // UPDATE STATUS
    // ========================================================

    function updateUploadStatus(status) {

        const statusElement =
            document.querySelector(
                ".selected-file .upload-status"
            );


        if (!statusElement) {
            return;
        }


        statusElement.textContent =
            status;


        statusElement.classList.remove(
            "upload-success",
            "upload-failed"
        );


        if (
            status
                .toLowerCase()
                .includes("success")
        ) {

            statusElement.classList.add(
                "upload-success"
            );

        }


        if (
            status
                .toLowerCase()
                .includes("failed")
        ) {

            statusElement.classList.add(
                "upload-failed"
            );

        }

    }


    // ========================================================
    // SHOW SUCCESS POPUP
    // ========================================================

    function showSuccessPopup(fileName) {

        if (!popup) {
            return;
        }


        if (popupFileName) {

            popupFileName.innerHTML = `

                <strong>
                    ${escapeHtml(fileName)}
                </strong>

                has been added successfully.

            `;

        }


        // IMPORTANT:
        // Add the class and keep it visible.

        popup.classList.add(
            "show"
        );


        // Prevent page scrolling.

        document.body.style.overflow =
            "hidden";

    }


    // ========================================================
    // CLOSE POPUP
    // ========================================================

    function closePopup() {

        if (!popup) {
            return;
        }


        popup.classList.remove(
            "show"
        );


        document.body.style.overflow =
            "";

    }


    // ========================================================
    // CLOSE BUTTON
    // ========================================================

    if (popupClose) {

        popupClose.addEventListener(
            "click",
            closePopup
        );

    }


    // ========================================================
    // CLICK OUTSIDE
    // ========================================================

    if (popup) {

        popup.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === popup
                ) {

                    closePopup();

                }

            }
        );

    }


    // ========================================================
    // GO TO MY CONTRACTS
    // ========================================================

    if (goToContractsButton) {

        goToContractsButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "my-contracts.html";

            }
        );

    }


    // ========================================================
    // ESC KEY
    // ========================================================

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                popup &&
                popup.classList.contains("show")
            ) {

                closePopup();

            }

        }
    );


    // ========================================================
    // SHOW ERROR
    // ========================================================

    function showUploadError(message) {

        if (!filePreview) {

            alert(message);

            return;

        }


        const existingError =
            filePreview.querySelector(
                ".upload-error"
            );


        if (existingError) {

            existingError.textContent =
                message;

            return;

        }


        const errorElement =
            document.createElement(
                "div"
            );


        errorElement.className =
            "upload-error";


        errorElement.textContent =
            message;


        filePreview.appendChild(
            errorElement
        );

    }


    // ========================================================
    // FORMAT FILE SIZE
    // ========================================================

    function formatFileSize(bytes) {

        if (bytes === 0) {

            return "0 Bytes";

        }


        const sizes = [
            "Bytes",
            "KB",
            "MB",
            "GB"
        ];


        const index =
            Math.floor(
                Math.log(bytes) /
                Math.log(1024)
            );


        return (
            parseFloat(
                (
                    bytes /
                    Math.pow(
                        1024,
                        index
                    )
                ).toFixed(2)
            )
            +
            " "
            +
            sizes[index]
        );

    }


    // ========================================================
    // ESCAPE HTML
    // ========================================================

    function escapeHtml(text) {

        const div =
            document.createElement(
                "div"
            );


        div.textContent =
            text;


        return div.innerHTML;

    }

});