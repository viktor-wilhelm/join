/**
 * Checks if a user is logged in. 
 * If not, redirects automatically to the login page.
 *
 * @returns {Object|null} The logged-in user object, or null if no user is found.
 */
function protectPage() {
    const userData = sessionStorage.getItem('loggedInUser');
    if (!userData) {
        window.location.href = "../index.html";
        return null;
    }
    return JSON.parse(userData);
}

/**
 * Assigns colors to contacts based on available badge colors.
 * If a contact already has a color, it is kept.
 * Otherwise, cycles through the badge colors.
 *
 * @param {Array<Object>} contactsArray - Array of contact objects.
 * @returns {Array<Object>} The same array with color properties added.
 */
function assignContactColors(contactsArray) {
    if (!Array.isArray(contactsArray)) return [];

    const badgeColors = getBadgeColors();
    let colorIndex = 0;

    contactsArray.forEach(contact => {
        if (!contact.id) return;
        if (!contact.color) {
            contact.color = badgeColors[colorIndex];
            colorIndex = (colorIndex + 1) % badgeColors.length;
        }
    });
    return contactsArray;
}

/**
 * Retrieves the badge colors defined in CSS variables (--color-badge-1 to --color-badge-16).
 *
 * @returns {Array<string>} An array of badge color values as strings.
 */
function getBadgeColors() {
    const colors = [];
    for (let i = 1; i <= 16; i++) {
        const color = getComputedStyle(document.documentElement)
            .getPropertyValue(`--color-badge-${i}`)
            .trim();
        colors.push(color);
    }
    return colors;
}

/**
 * Formats a task date string into a localized date format.
 *
 * @param {string} dateStr - The task date as a string (e.g., "2026-02-24").
 * @returns {string|undefined} The formatted date (e.g., "24.02.2026") or undefined if input is invalid.
 */
function formatTaskDate(dateStr) {
    if (!dateStr) return;

    const date = new Date(dateStr);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
}

export {
  protectPage,
  assignContactColors,
  getBadgeColors,
  formatTaskDate,
};
