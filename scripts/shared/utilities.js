/**
 * Shared Utility Functions
 * Common helper functions used across multiple modules
 */

/**
 * Extracts initials from a full name
 * @param {string} name - The full name (e.g., "Max Mustermann")
 * @param {string} fallback - Fallback value if name is empty (default: "SM")
 * @returns {string} The initials (e.g., "MM")
 */
function getInitials(name, fallback = "SM") {
  if (!name || !name.trim()) return fallback;

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  const firstNameInitial = parts[0][0];
  const lastNameInitial = parts[parts.length - 1][0];
  return (firstNameInitial + lastNameInitial).toUpperCase();
}

export {
  getInitials,
};
