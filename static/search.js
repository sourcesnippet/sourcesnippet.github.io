import { fetchSnippets, getSearchQueryFromUrl, SEARCH_QUERY } from "/static/global.js";


// Properties
export const QUICK_SEARCH_DELAY = 300;  // Amount to wait before quick searching
export const DEFAULT_QUICK_SEARCH_COUNT = 5;
export const DEFAULT_SEARCH_SELECTORS = {
    searchInput: "#searchbar .search-input",
    searchBtn: "#searchbar .search-btn",
    searchDropdown: "#searchbar .search-dropdown",
    searchResultContainer: "#searchbar .search-results",
    searchMore: "#searchbar .search-more",
    searchNonefound: "#searchbar .search-nonefound",
    searchLoading: "#searchbar .search-loading"
}
let lastSearchId = 0;  // To avoid older quick search request from overriding newer one


// Methods
function debounce(func, delay) {
    let timeoutId;

    return function (...args) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => { func.apply(this, args); }, delay);
    };
}

function populateSearchDropdown(searchResultContainer, searchMoreElement, searchNonefoundElement, query = "", snippets = [], areMoreAvailable = false) {

    // Remove old quick search results
    const oldLinks = searchResultContainer.querySelectorAll('a');
    oldLinks.forEach(link => link.remove());


    // Change display of "show all results"
    searchMoreElement.style.display = areMoreAvailable ? "" : "none";
    searchMoreElement.href = `/?${SEARCH_QUERY}=${encodeURIComponent(query)}`;


    // Change display of "No results found"
    searchNonefoundElement.style.display = snippets.length == 0 && query.length != 0 ? "" : "none";


    // Add new quick search results
    snippets.forEach(item => {
        const anchor = document.createElement('a');
        anchor.href = item.url;
        anchor.textContent = item.title;
        anchor.title = item.title;
        searchResultContainer.appendChild(anchor);
    });
}

function setupSearch(quickSearchCount = DEFAULT_QUICK_SEARCH_COUNT, quickSearchDelay = QUICK_SEARCH_DELAY, selectors = DEFAULT_SEARCH_SELECTORS) {
    // Get all elements
    const searchInput = document.querySelector(selectors.searchInput);
    const searchBtn = document.querySelector(selectors.searchBtn);
    // const searchDropdown = document.querySelector(selectors.searchDropdown);
    const searchResultContainer = document.querySelector(selectors.searchResultContainer);
    const searchMore = document.querySelector(selectors.searchMore);
    const searchNonefound = document.querySelector(selectors.searchNonefound);
    const searchLoading = document.querySelector(selectors.searchLoading);


    // Add query to input if already searched for
    const searchQuery = getSearchQueryFromUrl();
    searchInput.value = searchQuery;


    // Create search methods
    const gotoSearchPage = () => {
        const query = searchInput.value;
        window.location.href = query ? `/?${SEARCH_QUERY}=${encodeURIComponent(query)}` : window.location.pathname;
    };
    const quickSearch = debounce(async () => {
        // Set new search id
        const thisSearchId = ++lastSearchId;


        // Set as loading
        populateSearchDropdown(searchResultContainer, searchMore, searchNonefound);  // Hide everything in dropdown
        searchLoading.style.display = "";


        // Get search results
        const query = searchInput.value;
        const quickSearchResults = (query === "") ? [] : (await fetchSnippets(query, [], quickSearchCount + 1)).snippets;
        if (thisSearchId !== lastSearchId) {
            return;
        }


        // Unset as loading
        searchLoading.style.display = "none";


        // Assign found snippets into dropdown
        let areMoreAvailable = quickSearchCount < quickSearchResults.length;  // Are there more snippets available than what is shown in quicksearch?
        populateSearchDropdown(searchResultContainer, searchMore, searchNonefound, query, quickSearchResults.slice(0, quickSearchCount), areMoreAvailable);
    }, quickSearchDelay);


    // Bind search method with button and input bar
    searchBtn.addEventListener("click", gotoSearchPage);
    searchInput.addEventListener("keydown", (event) => {  // Goto search page if pressed enter
        if (event.key === "Enter") {
            gotoSearchPage();
            return;
        }
    });
    searchInput.addEventListener("input", () => {  // Perform quick search after a small duration (to avoid sending redundant requests)
        quickSearch();
    });
}

setupSearch();