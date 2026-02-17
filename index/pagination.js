import { getSearchQueryFromUrl, getPageNumFromUrl, fetchSnippets, setupPaginationBtns, getTagsQueryFromUrl } from "/static/service.js"
import { SEARCH_QUERY } from "/static/service.js"

// Properties
const QUICK_SEARCH_DELAY = 400;  // Amount to wait before quick searching
const DEFAULT_QUICK_SEARCH_COUNT = 5;
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

function displaySearchQuery(searchQuery, selectors) {

    // Return if no query
    if (!searchQuery) {
        return;
    }


    // Show search banner
    let searchBanner = document.querySelector(selectors.searchBanner);
    searchBanner.style.display = "";


    // Show search query
    let searchDisplay = document.querySelector(selectors.searchDisplay);
    searchDisplay.textContent = searchQuery;
}

function populateSearchDropdown(dropdownElement, searchMoreElement, searchNonefoundElement, query, snippets, areMoreAvailable = false) {

    // Remove old quick search results
    const oldLinks = dropdownElement.querySelectorAll('a');
    oldLinks.forEach(link => {
        if (!link.isSameNode(searchMoreElement) && !link.isSameNode(searchNonefoundElement)) {
            link.remove()
        }
    });


    // Change display of "show all results"
    searchMoreElement.style.display = areMoreAvailable ? "block" : "none";
    searchMoreElement.href = `?${SEARCH_QUERY}=${encodeURIComponent(query)}`;


    // Change display of "No results found"
    searchNonefoundElement.style.display = snippets.length == 0 && query.length != 0 ? "block" : "none";


    // Add new quick search results
    snippets.forEach(item => {
        const anchor = document.createElement('a');
        anchor.href = item.url;
        anchor.textContent = item.title;
        anchor.title = item.title;
        dropdownElement.insertBefore(anchor, searchMoreElement);
    });

}

export function setupSearch(searchQuery = "", quickSearchCount = DEFAULT_QUICK_SEARCH_COUNT, selectors = {}) {

    // Show what was searched for (if any)
    if (searchQuery == "") {
        let searchQuery = getSearchQueryFromUrl();
        displaySearchQuery(searchQuery, selectors);
    }


    // Get all elements
    const searchInput = document.querySelector(selectors.searchInput);
    const searchBtn = document.querySelector(selectors.searchBtn);
    const searchDropdown = document.querySelector(selectors.searchDropdown);
    const searchMore = document.querySelector(selectors.searchMore);
    const searchNonefound = document.querySelector(selectors.searchNonefound);


    // Add query to input if already searched for
    searchInput.value = searchQuery;


    // Create search methods
    const gotoSearchPage = () => {
        const query = searchInput.value;
        window.location.href = query ? `?${SEARCH_QUERY}=${encodeURIComponent(query)}` : window.location.pathname;
    };
    const quickSearch = debounce(async () => {
        // Set new search id
        const thisSearchId = ++lastSearchId;


        // Get search results
        const query = searchInput.value;
        const quickSearchResults = (query === "") ? [] : (await fetchSnippets(query, [], quickSearchCount + 1)).snippets;
        console.log(quickSearchResults)
        if (thisSearchId !== lastSearchId) {
            return;
        }


        // Assign found snippets into dropdown
        let areMoreAvailable = quickSearchCount < quickSearchResults.length;  // Are there more snippets available than what is shown in quicksearch?
        populateSearchDropdown(searchDropdown, searchMore, searchNonefound, query, quickSearchResults.slice(0, quickSearchCount), areMoreAvailable);
    }, QUICK_SEARCH_DELAY);


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

export async function setupPage(resultsPerPage, quickSearchCount, selectors, substanceCallback) {

    // Show what was searched for (if any)
    let searchQuery = getSearchQueryFromUrl();
    displaySearchQuery(searchQuery, selectors);


    // Setup search functionality on page
    setupSearch(searchQuery, quickSearchCount, selectors);


    // Set search to loading
    let searchCount = document.querySelector(selectors.searchCount);
    searchCount.textContent = "Loading"


    // Get all snippets based on page number & search query
    const pageNumber = getPageNumFromUrl();
    const tags = getTagsQueryFromUrl();
    const { snippets, totalSnippets } = await fetchSnippets(searchQuery, tags, resultsPerPage, resultsPerPage * (pageNumber - 1));


    // Set search count
    searchCount.textContent = totalSnippets;


    // Add snippet data to all cards
    substanceCallback(snippets);


    // Setup pagination bar only if there are enough snippets to paginate
    if (resultsPerPage < totalSnippets) {
        const totalPages = 0 < totalSnippets ? Math.ceil(totalSnippets / resultsPerPage) : 1;
        let paginationBar = document.querySelector(selectors.paginationBar);
        paginationBar.style.display = "";  // Ensure pagination bar is visible
        setupPaginationBtns(paginationBar, pageNumber, totalPages);
    }
}
