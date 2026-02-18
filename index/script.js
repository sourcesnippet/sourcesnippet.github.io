import { setupPage } from "/pagination.js"
import { TAGS_QUERY } from "/static/global-script.js"


// Properties
export const RESULTS_PER_PAGE = 16;
export const QUICK_SEARCH_COUNT = 5;
export const SNIPPET_CARD_SELECTOR = ".snippet-card";
export const SNIPPET_LOADING_CLASS = "is-loading"
export const SNIPPET_THUMBNAIL_SELECTOR = ".snippet-card-thumbnail"
export const SNIPPET_IMG_SELECTOR = ".snippet-card-thumbnail img"
export const SNIPPET_TITLE_SELECTOR = ".snippet-card-title"
export const SNIPPET_TITLE_DIV_SELECTOR = ".snippet-card-title div"
export const SNIPPET_TAG_CONTAINER_SELECTOR = ".snippet-card-tags"
export const SNIPPET_TAG_CLASS = "tag"
export const SEARCH_INPUT_SELECTOR = "#searchbar .search-input"
export const SEARCH_DROPDOWN_SELECTOR = "#searchbar .search-dropdown"
export const SEARCH_MORE_SELECTOR = "#searchbar .search-more"
export const SEARCH_NONEFOUND_SELECTOR = "#searchbar .search-nonefound"
export const SEARCH_BTN_SELECTOR = "#searchbar .search-btn"
export const QUERY_BANNER_SELECTOR = "#query-banner"
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
        if (snippets.length <= i) {
            card.style.display = "none";
            continue;
        }


        // Add image to thumbnail
        let imgElement = card.querySelector(SNIPPET_IMG_SELECTOR);
        let thumbnail = snippets[i]?.thumbnail;
        const imgUrl = thumbnail ? new URL(thumbnail, window.location.origin + snippets[i]?.url).href : "";
        imgElement.src = imgUrl;


        // Add link to thumbnail
        let thumbnailElement = card.querySelector(SNIPPET_THUMBNAIL_SELECTOR);
        thumbnailElement.href = snippets[i]?.url;
        thumbnailElement.style.display = thumbnail ? "" : "none";


        // Add text to title
        let titleDivElement = card.querySelector(SNIPPET_TITLE_DIV_SELECTOR);
        titleDivElement.textContent = snippets[i]?.title;


        // Add link to title
        let titleElement = card.querySelector(SNIPPET_TITLE_SELECTOR);
        titleElement.href = snippets[i]?.url;


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
            tagElement.href = `/?${TAGS_QUERY}=${encodeURIComponent(tags[i])}`;
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
        QUICK_SEARCH_COUNT,
        {
            searchInput: SEARCH_INPUT_SELECTOR,
            searchDropdown: SEARCH_DROPDOWN_SELECTOR,
            searchMore: SEARCH_MORE_SELECTOR,
            searchNonefound: SEARCH_NONEFOUND_SELECTOR,
            searchBtn: SEARCH_BTN_SELECTOR,
            queryBanner: QUERY_BANNER_SELECTOR,
            paginationBar: PAGINATION_BAR_SELECTOR
        },
        updateSnippetCards
    );
}
