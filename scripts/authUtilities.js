const authCard = document.querySelector(".auth-card");
const slider = document.getElementById("authSlider");
const signupWrapper = document.getElementById("signupWrapper");
const signupGroup = document.querySelectorAll(".auth-signup-group");
const loginWrapper = document.getElementById("loginWrapper");
const btnToSignup = document.getElementById("toSignup");
const btnToLogin = document.getElementById("toLogin");
const toSignupOnMobile = document.getElementById('toSignupOnMobile');
const eyeOff = "./assets/img/auth/visibility-off-default.svg";
const eyeOn = "./assets/img/auth/visibility-on-default.svg";

/**
 * Toggles the visibility of a password input field and updates the corresponding icon.
 * @param {HTMLInputElement} input - The password input field.
 * @param {HTMLImageElement} icon - The icon element used as the toggle button.
 */
function initPasswordIconToggle(input, icon) {
    if (!input || !icon) return;

    input.onfocus = function () {
        if (input.type === 'password') {
            icon.src = eyeOff;
        }
    };

    icon.onclick = function () {
        if (input.type === 'password') {
            input.type = 'text';
            icon.src = eyeOn;
        } else {
            input.type = 'password';
            icon.src = eyeOff;
        }
    };
}

/**
 * Updates the authentication card height to match the active content
 * for smooth view transitions.
 * @param {HTMLElement} activeWrapper - The active content wrapper element.
 */
function updateCardHeight(activeWrapper) {
    if (activeWrapper && authCard) {
        const height = activeWrapper.offsetHeight;
        authCard.style.height = height + "px";
    }
}

/**
 * Shows an error message and highlights the associated input group.
 * @param {HTMLElement} element - The element to display the error message.
 * @param {HTMLElement} group - The input group to style as an error.
 * @param {string} message - The error message text.
 */
function showInputError(element, group, message) {
    if (message) element.innerText = message;
    element.classList.add('show');
    if (group) group.classList.add('auth-card__input-group--error');
}

/**
 * Hides an error message and clears the error styling from an input group.
 * @param {HTMLElement} element - The element displaying the error message.
 * @param {HTMLElement} group - The input group to remove error styling from.
 */
function hideInputError(element, group) {
    element.classList.remove('show');
    if (group) group.classList.remove('auth-card__input-group--error');
}

/**
 * Switches the authentication view to the signup form.
 * @param {Event} event - The event triggering the switch (e.g., click).
 */
function showSignup(event) {
    event.preventDefault();
    if (slider) slider.classList.add("slide-to-signup");
    signupGroup.forEach(group => {
        group.classList.add("d-none-smooth");
    });
    updateCardHeight(signupWrapper);
}

/**
 * Switches the authentication view back to the login form.
 * @param {Event} event - The event triggering the switch (e.g., click).
 */
function showLogin(event) {
    event.preventDefault();
    if (slider) slider.classList.remove("slide-to-signup");
    signupGroup.forEach(group => {
        group.classList.remove("d-none-smooth");
    });
    updateCardHeight(loginWrapper);
}

/**
 * Initializes the authentication card height and enables transitions.
 */
function initAuthHeight() {
    authCard.classList.remove("transition-ready");
    updateCardHeight(loginWrapper);
    requestAnimationFrame(() => {
        authCard.classList.add("ready", "transition-ready");
    });
}

/**
 * Initializes the authentication UI once the DOM is fully loaded,
 * setting up card height and attaching navigation event listeners.
 */
document.addEventListener("DOMContentLoaded", () => {
    initAuthHeight();
    if (btnToSignup) {
        btnToSignup.onclick = showSignup;
    }
    if (toSignupOnMobile) {
        toSignupOnMobile.onclick = showSignup;
    }
    if (btnToLogin) {
        btnToLogin.onclick = showLogin;
    }
});

export {
  initPasswordIconToggle,
  updateCardHeight,
  showInputError,
  hideInputError,
  showSignup,
  showLogin,
  initAuthHeight,
};
