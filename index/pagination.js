import { getSearchQueryFromUrl, getPageNumFromUrl, fetchSnippets, setupPaginationBtns, gotoPage } from "/static/service.js"


// Methods
function displaySearchQuery(searchQuery, searchBannerSelector, searchDisplaySelector) {

    // Return if no query
    if (!searchQuery) {
        return;
    }


    // Show search banner
    let searchBanner = document.querySelector(searchBannerSelector);
    searchBanner.style.display = "";


    // Show search query
    let searchDisplay = document.querySelector(searchDisplaySelector);
    searchDisplay.textContent = searchQuery;
}

function setupSearch(searchQuery, searchInputSelector, searchBtnSelector) {
    // Get search elements
    let searchInput = document.querySelector(searchInputSelector);
    let searchBtn = document.querySelector(searchBtnSelector);


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

export async function setupPage(resultsPerPage, searchBannerSelector, searchDisplaySelector, searchInputSelector, searchBtnSelector, searchCountSelector, paginationBarSelector, substanceCallback) {

    // Show what was searched for (if any)
    let searchQuery = getSearchQueryFromUrl();
    displaySearchQuery(searchQuery, searchBannerSelector, searchDisplaySelector);


    // Setup search functionality on page
    setupSearch(searchQuery, searchInputSelector, searchBtnSelector);


    // Set search to loading
    let searchCount = document.querySelector(searchCountSelector);
    searchCount.textContent = "Loading"


    // Get all snippets based on page number & search query
    const pageNumber = getPageNumFromUrl();
    const { snippets, totalSnippets } = await fetchSnippets(searchQuery, resultsPerPage, resultsPerPage * (pageNumber - 1));


    // Redirect to closest page number if at invalid page number
    const totalPages = 0 < totalSnippets ? Math.ceil(totalSnippets / resultsPerPage) : 1;
    console.log(totalPages, pageNumber)
    // if (totalPages < pageNumber) {
    //     gotoPage(totalPages);
    //     return;
    // }
    // else if (pageNumber < 1) {
    //     gotoPage(1);
    //     return;
    // }


    // Set search count
    searchCount.textContent = totalSnippets;


    // Add snippet data to all cards
    substanceCallback(snippets);


    // Setup pagination bar only if there are enough snippets to paginate
    if (resultsPerPage < totalSnippets) {
        let paginationBar = document.querySelector(paginationBarSelector);
        paginationBar.style.display = "";  // Ensure pagination bar is visible
        setupPaginationBtns(paginationBar, pageNumber, totalPages);
    }
}
