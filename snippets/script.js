import { getPageNumFromUrl, fetchSnippetsData, assignPaginationBtns, getSearchQueryFromUrl } from "/static/pagination.js"
import * as pagefind from "/static/search/pagefind.js";


// Properties
export const RESULTS_PER_PAGE = 500;
export const SNIPPET_LIST_SELECTOR = "#raw-snippet-list"
export const PAGINATION_BAR_SELECTOR = "#pagination"
export const SEARCH_INPUT_SELECTOR = "#searchbar .search-input"
export const SEARCH_BTN_SELECTOR = "#searchbar .search-btn"
export const SEARCH_BANNER_SELECTOR = "#search-banner"
export const SEARCH_DISPLAY_SELECTOR = "#search-display"


// Methods
function removeChildren(element) {
    while (element.firstChild) {
        element.removeChild(element.lastChild);
    }
}

function addSnippetsToList(snippets, listElement, doc) {
    // Add elements to list
    const fragment = doc.createDocumentFragment();
    for (let i = 0; i < snippets.length; i++) {

        // Create elements
        const li = doc.createElement("li");
        const a = doc.createElement("a");


        // Add title and link
        a.textContent = snippets[i].title;
        a.href = snippets[i].url;


        // Add element to parent
        li.appendChild(a);
        fragment.appendChild(li);
    }

    listElement.appendChild(fragment);
}

function updatePaginationBar(stats, pageNumber) {

    // Return if there aren't enough snippets to paginate
    if (stats.snippetsCount <= RESULTS_PER_PAGE) {
        return;
    }


    // Get pagination bar
    let paginationBar = document.querySelector(PAGINATION_BAR_SELECTOR);
    paginationBar.style.display = "";  // Ensure pagination bar is visible


    // Update pagination bar buttons
    let totalPages = Math.ceil(stats.snippetsCount / RESULTS_PER_PAGE);
    assignPaginationBtns(paginationBar, pageNumber, totalPages);
}

function displaySearchQuery(searchQuery) {

    // Return if no query
    if (!searchQuery) {
        return;
    }


    // Show search banner
    let searchBanner = document.querySelector(SEARCH_BANNER_SELECTOR);
    searchBanner.style.display = "";


    // Show search query
    let searchDisplay = document.querySelector(SEARCH_DISPLAY_SELECTOR);
    searchDisplay.textContent = searchQuery;
}

function addSearchFunctionality(searchQuery) {
    // Get search elements
    let searchInput = document.querySelector(SEARCH_INPUT_SELECTOR);
    let searchBtn = document.querySelector(SEARCH_BTN_SELECTOR);


    // Add query to input if already searched for
    searchInput.value = searchQuery;


    // Create search method
    const search = () => {
        const query = searchInput.value;
        if (query) {
            window.location.href = `?search=${encodeURIComponent(query)}`;
        }
    };


    // Bind search method with button and input bar
    searchBtn.addEventListener('click', search);
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            search();
        }
    });
}

async function main() {

    // Display search query on page
    let searchQuery = getSearchQueryFromUrl();
    displaySearchQuery(searchQuery);


    // Add search functionality
    addSearchFunctionality(searchQuery);


    // Get all snippets based on page number
    const pageNumber = getPageNumFromUrl();
    const { stats, snippets } = await fetchSnippetsData(RESULTS_PER_PAGE, RESULTS_PER_PAGE * (pageNumber - 1));


    // Clear list
    const listElement = document.querySelector(SNIPPET_LIST_SELECTOR);
    removeChildren(listElement);


    // Add to list
    addSnippetsToList(snippets, listElement, document);


    // Update pagination bar
    updatePaginationBar(stats, pageNumber);
}


// To ensure this only runs in browser
if (typeof window !== "undefined") {
    main();
}
