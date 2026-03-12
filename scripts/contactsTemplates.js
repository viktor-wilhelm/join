/**
 * Generates the HTML template for a contact list entry.
 *
 * @param {string} initial - Initials of the contact
 * @param {string} name - Full name of the contact
 * @param {string} email - Email address of the contact
 * @param {number} index - Index of the contact in the list
 * @returns {string} HTML string for the contact card
 */
function templateContact(initial, name, email, color, index) {
    return `
    <div class="contact-card" id="${name}" onclick="showContactDetails(${index})">
        <div class="contact-initial badge" style="background-color: ${color};">${initial}</div>
        <div>
            <h3>${name}</h3>
            <div class="contact-email">${email}</div>
        </div>
    </div>
  `;
}

/**
 * Generates the HTML template for the contact detail view.
 *
 * @param {{name: string, email: string, phone: string}} contact - Contact object
 * @param {number} index - Index of the contact
 * @param {string} initial - Initials of the contact
 * @param {string} badgeColor - Background color of the contact badge
 * @returns {string} HTML string for the contact detail view
 */
function templateContactDetails(contact, index, initial, badgeColor) {
    return `
    <div class="contact-detail-slide">
        <div class="contacts-detail-header">
            ${templateContactDetailHeader(contact, index, initial, badgeColor)}
        </div>
        <div>
            <div class="contact-information-title">Contact Information</div>              
        </div>
        <div class="contacts-detail-information">
            ${templateContactDetailInformation(contact)}
        </div>
    </div>
  `;
}

/**
 * Generates the HTML template for the contact detail header.
 *
 * @param {{name: string}} contact - Contact object
 * @param {number} index - Index of the contact
 * @param {string} initial - Initials of the contact
 * @param {string} badgeColor - Background color of the badge
 * @returns {string} HTML string for the contact detail header
 */
function templateContactDetailHeader(contact, index, initial, badgeColor) {
    return `
       <div class="contact-detail-initial" style="background-color: ${badgeColor};">${initial}</div>
            <div class="contact-detail-name-and-actions">
                <div class="contact-detail-name">${contact.name}</div>
                <div class="action__button">
                    <button onclick="editContact(${index})" class="contact-detail-edit-button"></button>
                    <button onclick="deleteContact(${index})" class="contact-detail-delete-button"></button>
                </div>
            </div>
    `;
}

/**
 * Generates the HTML template for contact information.
 *
 * @param {{email: string, phone: string}} contact - Contact object
 * @returns {string} HTML string for contact information
 */
function templateContactDetailInformation(contact) {
    return `
       <div class="contact-info">
            <div class="contact-info-header">Email</div> 
            <div class="contact-info-email">${contact.email}</div>
            <div class="contact-info-header">Phone</div> 
            <div class="contact-info-phone">${contact.phone || "N/A"}</div>
        </div>
    `;
}

/**
 * Generates the HTML template for a letter group header.
 *
 * @param {string} firstLetter - The letter used for grouping contacts
 * @returns {string} HTML string for the letter group
 */
function templateRenderLetterGroup(firstLetter) {
    return `
    <div class="letter-group">
        <h2 class="letter-title">${firstLetter}</h2>
        <hr>
    </div>
  `;
}

/**
 * Generates the HTML template for the "Add New Contact" view.
 *
 * @returns {string} HTML string for the add contact view
 */
function templateAddNewContact() {
    return `
        <div class="form-contact-container">
            <div class="form-contact-header">
                ${templateAddNewContactheader()}
            </div>
                <div class="add-new-contact-profile-picture">
                    ${templateAddNewContactProfilePicture()}
                </div>
            <div class="add-new-contact-form">
                ${templateAddNewContactForm()}
            </div>
        </div>
    `;
}

/**
 * Generates the header section for the "Add New Contact" view.
 *
 * @returns {string} HTML string for the add contact header
 */
function templateAddNewContactheader() {
    return `
        <div class="form-contact__logo"><img src="../assets/img/contacts/join_logo.svg" alt="Join Logo"></div>
        <div>
            <div class="form-contact-header-title">Add Contact </div>
            <div class="form-contact-subtitle">Tasks are better with a team!</div>
        </div>
        <div class="form-contact-header-line">___________________</div>
    `;
}

/**
 * Generates the profile picture placeholder for a new contact.
 *
 * @returns {string} HTML string for the profile picture
 */
function templateAddNewContactProfilePicture() {
    return `
        <div class="contact-detail-initial-form" style="background-color: #D1D1D1;"><img src="../assets/img/contacts/personwhite.svg" alt="Contact Initial"></div>
    `;
}

/**
 * Generates the form for adding a new contact.
 *
 * @returns {string} HTML string for the add contact form
 */
function templateAddNewContactForm() {
    return `
        <div class="close-button" onclick="closeEditContact()">
            <img src="../assets/img/contacts/cancel.svg" class="close-button__desktop" alt="Cancel">
            <img src="../assets/img/contacts/closewhite.svg" class="close-button__mobile" alt="Cancel">
        </div>
        <div class="input-container">
            <input type="text" class="form-input-name" id="newContactName" placeholder="Name" required>
            <div id="errorName" class="error-message"></div>
        </div>
        <div class="input-container">
        <input type="email" class="form-input-email" id="newContactEmail" placeholder="Email" required>
        <div id="errorEmail" class="error-message"></div>
        </div>
        <div class="input-container">
            <input type="text" class="form-input-phone" id="newContactPhone" placeholder="Phone" required>
            <div id="errorPhone" class="error-message"></div>
        </div>
        <div class="form-contact-buttons">
            <button onclick="closeEditContact()" class="cancel-button">Cancel <img src="../assets/img/contacts/cancel.svg" alt="Cancel"></button>
            <button onclick="validateAndCreate()" class="create-contact-button">Create Contact <img src="../assets/img/contacts/check.svg" alt="Save"></button>
        </div>
    `;
}

/**
 * Generates the HTML template for the "Edit Contact" view.
 *
 * @param {number} index - Index of the contact
 * @param {string} name - Contact name
 * @param {string} email - Contact email
 * @param {string} phone - Contact phone number
 * @param {string} initial - Contact initials
 * @param {string} badgeColor - Background color of the badge
 * @returns {string} HTML string for the edit contact view
 */
function templateEditContact(index, name, email, phone, initial, badgeColor) {
    return `
        <div class="form-contact-container">
            <div class="form-contact-header">
              ${templateEditContactHeader()}
            </div>
                <div class="add-new-contact-profile-picture">
                    ${templateEditContactProfilePicture(badgeColor, initial)}
                </div>
            <div class="add-new-contact-form">
                ${templateEditContactForm(name, email, phone, index)}
            </div>
        </div>
    `;
}

/**
 * Generates the header section for the "Edit Contact" view.
 *
 * @returns {string} HTML string for the edit contact header
 */
function templateEditContactHeader() {
    return `
        <div><img src="../assets/img/contacts/join_logo.svg" alt="Join Logo" class="form-contact__logo"></div>
        <div class="form-contact-header-title">Edit contact</div>
        <div class="form-contact-header-line">___________________</div>
    `;
}

/**
 * Generates the profile picture for editing a contact.
 *
 * @param {string} badgeColor - Background color of the badge
 * @param {string} initial - Contact initials
 * @returns {string} HTML string for the profile picture
 */
function templateEditContactProfilePicture(badgeColor, initial) {
    return `
        <div class="contact-detail-initial-form" style="background-color: ${badgeColor};">
            ${initial}
        </div>

    `;
}

/**
 * Generates the form for editing a contact.
 *
 * @param {string} name - Contact name
 * @param {string} email - Contact email
 * @param {string} phone - Contact phone number
 * @param {number} index - Index of the contact
 * @returns {string} HTML string for the edit contact form
 */
function templateEditContactForm(name, email, phone, index) {
    return `
        <div class="close-button" onclick="closeEditContact()">
            <img src="../assets/img/contacts/cancel.svg" class="close-button__desktop" alt="Cancel">
            <img src="../assets/img/contacts/closewhite.svg" class="close-button__mobile" alt="Cancel">
        </div>
        <input type="text" class="form-input-name" id="newContactName" placeholder="Name" value="${name}" required>
        <input type="email" class="form-input-email" id="newContactEmail" placeholder="Email" value="${email}" required>
        <input type="text" class="form-input-phone" id="newContactPhone" placeholder="Phone" value="${phone}" required>
        <div class="form-contact-buttons">
            <button onclick="deleteContact(${index})" class="delete-button">Delete</button>
            <button onclick="confirmEditContact(${index})" class="save-contact-button">Save <img src="../assets/img/contacts/check.svg" alt="Save"></button>
        </div>
    `;
}

/**
 * Generates the HTML template for the "show more" action buttons on mobile devices.
 * The template includes buttons for editing and deleting a contact.
 *
 * @param {number} index - The index of the contact in the contacts array.
 * @returns {string} HTML string containing the mobile action buttons.
 */
function templateShowMoreAction(index) {
    return `
        <div class="action__button-mobile">
            <div><button onclick="editContact(${index}), closeActionFab()" class="contact-detail-edit-button"></button></div>
            <div><button onclick="deleteContact(${index}), contactsBackMobile(${index})" class="contact-detail-delete-button"></button></div>
        </div>
    `;
}

/**
 * Generates the HTML template for the floating action button (FAB).
 * The button is represented by an icon used to trigger additional actions.
 *
 * @returns {string} HTML string containing the floating action button icon.
 */
function templateActionFab() {
    return `
        <i class="icon-user-plus"><img src="../assets/img/contacts/more.svg"> </i>
    `;
}
export {
  templateContact,
  templateContactDetails,
  templateContactDetailHeader,
  templateContactDetailInformation,
  templateRenderLetterGroup,
  templateAddNewContact,
  templateAddNewContactheader,
  templateAddNewContactProfilePicture,
  templateAddNewContactForm,
  templateEditContact,
  templateEditContactHeader,
  templateEditContactProfilePicture,
  templateEditContactForm,
  templateShowMoreAction,
  templateActionFab,
};
