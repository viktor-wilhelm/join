/**
 * Includes external HTML files into the current page
 * Looks for elements with the w3-include-html attribute and replaces their content
 * @returns {Promise<void>}
 */
async function includeHTML() {
  const elements = document.querySelectorAll("[w3-include-html]");
  for (const node of elements) {
    const file = node.getAttribute("w3-include-html");
    try {
      const resp = await fetch(file);
      if (resp.ok) {
        node.innerHTML = await resp.text();
      }
    } catch (e) {
      console.error("Error loading include:", file);
    }
    node.removeAttribute("w3-include-html");
  }
}

export {
  includeHTML,
};
