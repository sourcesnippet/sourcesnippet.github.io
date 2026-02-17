import { setupPage } from "/pagination.js"
import { getPageNumFromUrl } from "/static/service.js"


// Properties
export const RESULTS_PER_PAGE = 500;
export const QUICK_SEARCH_COUNT = 4;
export const SNIPPET_LIST_SELECTOR = "#raw-snippet-list"
export const SEARCH_INPUT_SELECTOR = "#searchbar .search-input"
export const SEARCH_BTN_SELECTOR = "#searchbar .search-btn"
export const SEARCH_BANNER_SELECTOR = "#search-banner"
export const SEARCH_COUNT_SELECTOR = "#search-count"
export const SEARCH_DISPLAY_SELECTOR = "#search-display"
export const PAGINATION_BAR_SELECTOR = "#pagination"


// Methods
function addSnippetsToList(snippets) {

    // Get list element
    const pageNumber = getPageNumFromUrl();
    const listElement = document.querySelector(SNIPPET_LIST_SELECTOR);
    listElement.start = RESULTS_PER_PAGE * (pageNumber - 1) + 1  // From which number to start list from


    // Remove old elements
    while (listElement.firstChild) {
        listElement.removeChild(listElement.lastChild);
    }


    // Iterate and create li items
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < snippets.length; i++) {

        // Create elements
        const li = document.createElement("li");
        const a = document.createElement("a");


        // Add title and link
        a.textContent = snippets[i].title;
        a.href = snippets[i].url;


        // Add element to parent
        li.appendChild(a);
        fragment.appendChild(li);
    }


    // Add all to list
    listElement.appendChild(fragment);
}


// To ensure this only runs in browser
if (typeof window !== "undefined") {
    setupPage(
        RESULTS_PER_PAGE,
        QUICK_SEARCH_COUNT,
        {
            searchBanner: SEARCH_BANNER_SELECTOR,
            searchDisplay: SEARCH_DISPLAY_SELECTOR,
            searchInput: SEARCH_INPUT_SELECTOR,
            searchBtn: SEARCH_BTN_SELECTOR,
            searchCount: SEARCH_COUNT_SELECTOR,
            paginationBar: PAGINATION_BAR_SELECTOR,
        },
        addSnippetsToList
    );
}
