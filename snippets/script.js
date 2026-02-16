import { getSearchQueryFromUrl, getPageNumFromUrl, fetchSnippets, setupPaginationBtns, gotoPage } from "/static/service.js"


// Properties
export const RESULTS_PER_PAGE = 2;
export const SNIPPET_LIST_SELECTOR = "#raw-snippet-list"
export const PAGINATION_BAR_SELECTOR = "#pagination"
export const SEARCH_INPUT_SELECTOR = "#searchbar .search-input"
export const SEARCH_BTN_SELECTOR = "#searchbar .search-btn"
export const SEARCH_BANNER_SELECTOR = "#search-banner"
export const SEARCH_COUNT_SELECTOR = "#search-count"
export const SEARCH_DISPLAY_SELECTOR = "#search-display"


// Methods
function addSnippetsToList(snippets, listElement, doc) {

    // Remove old elements
    while (listElement.firstChild) {
        listElement.removeChild(listElement.lastChild);
    }


    // Iterate and create li items
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


    // Add all to list
    listElement.appendChild(fragment);
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

function setupSearch(searchQuery) {
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
        } else {
            window.location.href = window.location.pathname;
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

function setupPaginationBar(currentPage, totalPages) {
    let paginationBar = document.querySelector(PAGINATION_BAR_SELECTOR);
    paginationBar.style.display = "";  // Ensure pagination bar is visible
    setupPaginationBtns(paginationBar, currentPage, totalPages);
}

async function main() {

    // Show what was searched for (if any)
    let searchQuery = getSearchQueryFromUrl();
    displaySearchQuery(searchQuery);


    // Setup search functionality on page
    setupSearch(searchQuery);


    // Set search to loading
    let searchCount = document.querySelector(SEARCH_COUNT_SELECTOR);
    searchCount.textContent = "Loading"


    // Get all snippets based on page number & search query
    const pageNumber = getPageNumFromUrl();
    const { snippets, totalSnippets } = await fetchSnippets(searchQuery, RESULTS_PER_PAGE, RESULTS_PER_PAGE * (pageNumber - 1));


    // Redirect to closest page number if at invalid page number
    const totalPages = 0 < totalSnippets ? Math.ceil(totalSnippets / RESULTS_PER_PAGE) : 1;
    if (totalPages < pageNumber) {
        gotoPage(totalPages);
        return;
    }
    else if (pageNumber < 1) {
        gotoPage(1);
        return;
    }


    // Set search count
    searchCount.textContent = totalSnippets;


    // Add snippets to list
    const listElement = document.querySelector(SNIPPET_LIST_SELECTOR);
    listElement.start = RESULTS_PER_PAGE * (pageNumber - 1) + 1  // From which number to start list from
    addSnippetsToList(snippets, listElement, document);


    // Setup pagination bar only if there are enough snippets to paginate
    if (RESULTS_PER_PAGE < totalSnippets) {
        let totalPages = Math.ceil(totalSnippets / RESULTS_PER_PAGE);
        setupPaginationBar(pageNumber, totalPages);
    }
}


// To ensure this only runs in browser
if (typeof window !== "undefined") {
    main();
}
