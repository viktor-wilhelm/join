import { getData, postData } from './firebase.js';
import { showInputError, hideInputError, initPasswordIconToggle } from './authUtilities.js';
const signupForm = document.getElementById('signupForm');
const signupName = document.getElementById('signupName');
const signupEmail = document.getElementById('signupEmail');
const signupPassword = document.getElementById('signupPassword');
const signupConfirmPassword = document.getElementById('signupConfirmPassword');
const signupBtn = document.getElementById('signupBtn');

const signUpNameGroup = document.getElementById('signUpNameGroup');
const signEmailGroup = document.getElementById('signEmailGroup');
const signupPasswordGroup = document.getElementById('signupPasswordGroup');
const signupConfirmGroup = document.getElementById('signupConfirmGroup');

const signupNameError = document.getElementById('signupNameError');
const signupEmailError = document.getElementById('signupEmailError');
const signupPasswordError = document.getElementById('signupPasswordError');
const signupConfirmError = document.getElementById('signupConfirmError');

const policyCheckbox = document.getElementById('policyCheckbox');
const policyError = document.getElementById('policyError');
const passwordIcon = document.getElementById('signupPasswordIcon');
const confirmPasswordIcon = document.getElementById('signupConfirmIcon');
const signupSuccessModal = document.getElementById('signupSuccessModal');


initPasswordIconToggle(signupPassword, passwordIcon);
initPasswordIconToggle(signupConfirmPassword, confirmPasswordIcon);


/**
 * Validates the name input in the signup form.
 * @returns {boolean} True if the input is non-empty; false otherwise.
 */
function validateName() {
    if (signupName.value.trim() === "") {
        showInputError(signupNameError, signUpNameGroup, "Please enter your name.");
        return false;
    }
    hideInputError(signupNameError, signUpNameGroup);
    return true;
}

/** 
 * Validates the email input in the signup form.
 * @returns {boolean} True if the email is valid; false otherwise.
 */
function validateEmail() {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(signupEmail.value)) {
        showInputError(signupEmailError, signEmailGroup, "Please enter a valid email.");
        return false;
    }
    hideInputError(signupEmailError, signEmailGroup);
    return true;
}

/**
 * Validates the password and confirm password inputs in the signup form.
 * @return {boolean} True if both passwords are valid and match; false otherwise.
 */
function validatePasswords() {
    if (signupPassword.value.length < 6) {
        showInputError(signupPasswordError, signupPasswordGroup, "Password must be at least 6 characters long.");
        return false;
    }
    if (signupPassword.value !== signupConfirmPassword.value) {
        showInputError(signupConfirmError, signupConfirmGroup, "Your passwords don't match. Please try again.");
        return false;
    }
    hideInputError(signupPasswordError, signupPasswordGroup);
    hideInputError(signupConfirmError, signupConfirmGroup);
    return true;
}

/**
 * Validates if the privacy policy checkbox is checked.
 * @return {boolean} True if checked; false otherwise.
 */
function validatePolicy() {
    if (!policyCheckbox.checked) {
        policyError.innerText = "Please accept the Privacy Policy.";
        policyError.classList.add('show');
        return false;
    }
    policyError.classList.remove('show');
    return true;
}

/**
 * Gathers new user data from the signup form.
 * @return {Object} An object containing the user's name, email, and password.
 */
function getNewUserData() {
    return {
        name: signupName.value.trim(),
        email: signupEmail.value.trim(),
        password: signupPassword.value
    };
}

/**
 * Sets the submitting state of the signup button.
 * @param {boolean} isSubmitting - Whether the form is currently submitting.
 */
function setSubmitting(isSubmitting) {
    signupBtn.disabled = isSubmitting;
}

/**
 * Validates all signup form inputs.
 * @return {boolean} True if all inputs are valid; false otherwise. 
 */
function isSignupValid() {
    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePasswords();
    const isPolicyValid = validatePolicy();
    return isNameValid && isEmailValid && isPasswordValid && isPolicyValid;
}

/**
 * Handles successful signup by showing a modal and switching to the login form.
 */
function handleSignupSuccess() {
    signupSuccessModal.classList.add('show');

    setTimeout(() => {
        signupSuccessModal.classList.remove('show');
        signupForm.reset();

        if (typeof showLogin === "function") {
            showLogin({ preventDefault: () => { } });
        }
    }, 2000);
}

/**
 * Checks if an email already exists in the database.
 * @param {string} email - The email to check.
 * @return {boolean} True if the email exists; false otherwise.
 */
async function checkIfEmailExists(email) {
    const allUsers = await getData("users");
    if (allUsers === null) {
        return false;
    }
    const userList = Object.values(allUsers);
    const found = userList.some(user => user.email.toLowerCase() === email.toLowerCase());
    return found;
}

/**
 * Displays an error message indicating the email is already in use.    
 */
function showEmailInUseError() {
    signupEmailError.innerText = "This email is already in use.";
    signupEmailError.classList.add('show');
    signEmailGroup.classList.add('auth-card__input-group--error');
}

/**
 * Creates a new user in the database.
 * @param {Object} userData - The new user's data.
 */
async function createUser(userData) {
    await postData("users", userData);
}

/**
 * Adds a new user after validating the signup form and checking for email uniqueness.
 * @return {Promise<void> } A promise that resolves when the user is added or an error occurs.
 */
async function addUser() {
    if (!isSignupValid()) return;
    const newUser = getNewUserData();
    setSubmitting(true);
    try {
        const emailExists = await checkIfEmailExists(newUser.email);
        if (emailExists) {
            showEmailInUseError();
            setSubmitting(false);
            return;
        }
        await createUser(newUser);
        handleSignupSuccess();
    } catch (error) {
        console.error("Firebase Error:", error);
    } finally {
        setSubmitting(false);
    }
}

/**
 * Handles the signup form submission event.
 * @param {Event} event - The form submission event.  
 */
function handleSignUpSubmit(event) {
    event.preventDefault();
    addUser();
}

/**
 * Handles input in the name field to hide error messages when valid.
 */
function handleNameInput() {
    if (signupName.value.trim() !== "") {
        hideInputError(signupNameError, signUpNameGroup);
    }
}

/**
 * Handles input in the email field to hide error messages when valid.
 */
function handleEmailInput() {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailPattern.test(signupEmail.value)) {
        hideInputError(signupEmailError, signEmailGroup);
    }
}

/**
 * Handles input in the password field to hide error messages when valid.
 */
function handlePasswordInput() {
    if (signupPassword.value.length >= 6) hideInputError(signupPasswordError, signupPasswordGroup);
    if (signupPassword.value === signupConfirmPassword.value) hideInputError(signupConfirmError, signupConfirmGroup);
}

/**
 * Handles input in the confirm password field to hide error messages when valid.
 */
function handleConfirmPasswordInput() {
    if (signupPassword.value === signupConfirmPassword.value) {
        hideInputError(signupConfirmError, signupConfirmGroup);
        if (signupPassword.value.length >= 6) hideInputError(signupPasswordError, signupPasswordGroup);
    }
}

/**
 * Handles changes to the policy checkbox to hide error messages when checked.
 */
function handlePolicyChange() {
    if (policyCheckbox.checked) {
        policyError.classList.remove('show');
    }
}

signupForm.addEventListener('submit', handleSignUpSubmit);
signupName.addEventListener('input', handleNameInput);
signupEmail.addEventListener('input', handleEmailInput);
signupPassword.addEventListener('input', handlePasswordInput);
signupConfirmPassword.addEventListener('input', handleConfirmPasswordInput);
policyCheckbox.addEventListener('change', handlePolicyChange);
