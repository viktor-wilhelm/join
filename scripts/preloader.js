const preloader = document.getElementById("preloader");
const animLogo = document.getElementById("animatingLogo");
const finalLogo = document.getElementById("headerLogoFinal");

/**
 * Starts the preloader animation by dynamically calculating the target 
 * logo position and coordinating the transition to the header.
 */
function startAnimation() {
    setTimeout(() => {
        const rect = finalLogo.getBoundingClientRect();
        animLogo.style.top = `${rect.top}px`;
        animLogo.style.left = `${rect.left}px`;
        animLogo.style.width = `${rect.width}px`;
        animLogo.style.transform = "translate(0, 0)";
        handleMobileLogo(animLogo);
        setTimeout(() => preloader.classList.add("loader-fade-out"), 300);
        setTimeout(() => finishAnimation(preloader, animLogo, finalLogo), 1200);
    }, 600);
}

/**
 * Switches the logo source to the blue version on mobile devices 
 * during the animation.
 * @param {HTMLElement} logo - The animated logo element to update.
 */
function handleMobileLogo(logo) {
    if (window.innerWidth <= 767) {
        setTimeout(() => {
            logo.src = "../assets/img/shared/join-logo-blue.svg";
        }, 390);
    }
}

/**
 * Finalizes the transition by revealing the header logo and 
 * removing the preloader elements from the DOM.
 * @param {HTMLElement} preloader - The preloader container.
 * @param {HTMLElement} animLogo - The animated logo element.
 * @param {HTMLElement} finalLogo - The static header logo.
 */
function finishAnimation(preloader, animLogo, finalLogo) {
    finalLogo.classList.remove("header-logo-hidden");
    finalLogo.classList.add("header-logo-visible");

    setTimeout(() => {
        animLogo.style.transition = "opacity 0.3s ease";
        animLogo.style.opacity = "0";
        setTimeout(() => {
            animLogo.style.display = "none";
            preloader.style.display = "none";
        }, 300);
    }, 50);
}

window.addEventListener("load", startAnimation);
