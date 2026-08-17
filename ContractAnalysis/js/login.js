// ============================================================
// LOGIN.JS
// SANAD - Dynamic User Login
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    const loginButton = document.querySelector(".login-btn");

    if (loginButton) {
        loginButton.addEventListener("click", handleLogin);
    }

});


// ============================================================
// LOGIN
// ============================================================

async function handleLogin() {

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const messageEl = document.getElementById("formMessage");

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!email || !password) {

        showMessage(
            messageEl,
            "Please fill in both fields."
        );

        return;
    }

    try {

        // ----------------------------------------------------
        // SEND LOGIN REQUEST
        // ----------------------------------------------------

        const response = await fetch(
            "http://127.0.0.1:5000/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        const data = await response.json();

        // ----------------------------------------------------
        // LOGIN ERROR
        // ----------------------------------------------------

        if (!response.ok) {

            showMessage(
                messageEl,
                data.error || "Invalid email or password."
            );

            return;
        }

        // ----------------------------------------------------
        // CHECK USER
        // ----------------------------------------------------

        if (!data.user || !data.user.id) {

            showMessage(
                messageEl,
                "Login succeeded, but user information is missing."
            );

            console.error(
                "Invalid login response:",
                data
            );

            return;
        }

        const user = data.user;

        // ----------------------------------------------------
        // SAVE COMPLETE USER PROFILE
        // ----------------------------------------------------

        const userProfile = {

            id: user.id,

            fullName:
                user.full_name || "",

            email:
                user.email || "",

            phone:
                user.phone_number || "",

            jobTitle:
                user.job_title || "",

            company:
                user.company || "",

            department:
                user.department || "",

            employeeId:
                user.employee_id || "",

            role:
                user.role || "employee"

        };


        // ----------------------------------------------------
        // SAVE PROFILE
        // ----------------------------------------------------

        localStorage.setItem(
            "profile",
            JSON.stringify(userProfile)
        );


        // ----------------------------------------------------
        // SAVE USER ID
        // ----------------------------------------------------

        localStorage.setItem(
            "user_id",
            String(user.id)
        );


        // ----------------------------------------------------
        // SAVE USER NAME
        // ----------------------------------------------------

        localStorage.setItem(
            "user_name",
            user.full_name || ""
        );


        // ----------------------------------------------------
        // SAVE USER EMAIL
        // ----------------------------------------------------

        localStorage.setItem(
            "user_email",
            user.email || ""
        );


        // ----------------------------------------------------
        // REMOVE OLD USER DATA
        //
        // This prevents an old user's name such as
        // "Jana Khalid" from appearing.
        // ----------------------------------------------------

        localStorage.removeItem("loggedUser");
        localStorage.removeItem("currentUser");
        localStorage.removeItem("username");
        localStorage.removeItem("current_user");


        // ----------------------------------------------------
        // DEBUG
        // ----------------------------------------------------

        console.log("=================================");
        console.log("LOGIN SUCCESS");
        console.log("User:", userProfile);
        console.log("Name:", userProfile.fullName);
        console.log("Department:", userProfile.department);
        console.log("=================================");


        // ----------------------------------------------------
        // GO TO DASHBOARD
        // ----------------------------------------------------

        window.location.href = "dashboard.html";


    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        showMessage(
            messageEl,
            "Could not reach the server. Is the backend running?"
        );

    }

}


// ============================================================
// SHOW MESSAGE
// ============================================================

function showMessage(el, text) {

    if (!el) {

        console.error(text);

        return;
    }

    el.textContent = text;

    el.style.display = "block";
}


// ============================================================
// TOGGLE PASSWORD
// ============================================================

function togglePassword() {

    const input =
        document.getElementById("password");

    if (!input) {
        return;
    }

    if (input.type === "password") {

        input.type = "text";

    } else {

        input.type = "password";

    }

}


