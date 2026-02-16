import { setupPage } from "/pagination.js"


// Properties
export const RESULTS_PER_PAGE = 16;
export const CARDS_PER_ROW = 4;
export const SNIPPET_CARD_SELECTOR = ".snippet-card";
export const SNIPPET_LOADING_CLASS = "is-loading"
export const SNIPPET_IMG_SELECTOR = ".snippet-card-thumbnail img"
export const SNIPPET_TITLE_SELECTOR = ".snippet-card-title"
export const SNIPPET_TITLE_DIV_SELECTOR = ".snippet-card-title div"
export const SNIPPET_TAG_CONTAINER_SELECTOR = ".snippet-card-tags"
export const SNIPPET_TAG_CLASS = "tag"
export const SEARCH_INPUT_SELECTOR = "#searchbar .search-input"
export const SEARCH_BTN_SELECTOR = "#searchbar .search-btn"
export const SEARCH_BANNER_SELECTOR = "#search-banner"
export const SEARCH_COUNT_SELECTOR = "#search-count"
export const SEARCH_DISPLAY_SELECTOR = "#search-display"
export const PAGINATION_BAR_SELECTOR = "#pagination"


// Methods
function updateSnippetCards(snippets) {

    // Iterate over all snippet cards
    const snippetCards = document.querySelectorAll(SNIPPET_CARD_SELECTOR);
    for (let i = 0; i < snippetCards.length; i++) {

        // Remove loading class
        const card = snippetCards[i];
        card.classList.remove(SNIPPET_LOADING_CLASS);


        // Hide/Remove card if no more snippets left
        if (snippets.length <= i && i < CARDS_PER_ROW) {
            card.style.visibility = "hidden";
            continue;
        }
        else if (snippets.length <= i) {
            card.style.display = "none";
            continue;
        }


        // Add thumbnail
        let imgElement = card.querySelector(SNIPPET_IMG_SELECTOR);
        let thumbnail = snippets[i]?.thumbnail;
        const imgUrl = thumbnail ? new URL(thumbnail, window.location.origin + snippets[i]?.url).href : "";
        imgElement.src = imgUrl;


        // Add title 
        let titleElement = card.querySelector(SNIPPET_TITLE_SELECTOR);
        titleElement.href = snippets[i]?.url;


        // Add link
        let titleDivElement = card.querySelector(SNIPPET_TITLE_DIV_SELECTOR);
        titleDivElement.textContent = snippets[i]?.title;


        // Remove existing tags
        let tagContainer = card.querySelector(SNIPPET_TAG_CONTAINER_SELECTOR);
        while (tagContainer.firstChild) {
            tagContainer.removeChild(tagContainer.firstChild);
        }


        // Add tags
        let tags = snippets[i]?.tags ?? [];
        for (let i = 0; i < tags.length; i++) {
            // Skip tag if empty
            if (tags[i] == "") {
                continue;
            }


            // Assign values to tag element
            const tagElement = document.createElement('a');
            tagElement.href = '#';
            tagElement.className = SNIPPET_TAG_CLASS;
            tagElement.textContent = tags[i];
            tagContainer.appendChild(tagElement);
        }
    }
}


// To ensure this only runs in browser
if (typeof window !== "undefined") {
    setupPage(
        RESULTS_PER_PAGE,
        SEARCH_BANNER_SELECTOR,
        SEARCH_DISPLAY_SELECTOR,
        SEARCH_INPUT_SELECTOR,
        SEARCH_BTN_SELECTOR,
        SEARCH_COUNT_SELECTOR,
        PAGINATION_BAR_SELECTOR,
        updateSnippetCards
    );
}
