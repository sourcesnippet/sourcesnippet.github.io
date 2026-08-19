const newDomain = "https://manasmakde.github.io";

function getRedirectUrl() {
    const currentPath = window.location.pathname;
    return newDomain + currentPath;
}
function updateFallbackLink() {
    const fallbackAnchor = document.getElementById("fallbackLink");
    if (!fallbackAnchor) {
        console.warn("fallback anchor not found, skipping href update");
        return;
    }
    fallbackAnchor.href = getRedirectUrl();
}

window.location.replace(getRedirectUrl());
document.addEventListener("DOMContentLoaded", updateFallbackLink);
