import { getSearchQueryFromUrl, getPageNumFromUrl, fetchSnippets, setupPaginationBtns, gotoPage } from "/static/service.js"


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
export const PAGINATION_BAR_SELECTOR = "#pagination"
export const SEARCH_INPUT_SELECTOR = "#searchbar .search-input"
export const SEARCH_BTN_SELECTOR = "#searchbar .search-btn"
export const SEARCH_BANNER_SELECTOR = "#search-banner"
export const SEARCH_COUNT_SELECTOR = "#search-count"
export const SEARCH_DISPLAY_SELECTOR = "#search-display"


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
    console.log(snippets)


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


    // Add snippet data to all cards
    updateSnippetCards(snippets);


    // Setup pagination bar only if there are enough snippets to paginate
    if (RESULTS_PER_PAGE < totalSnippets) {
        setupPaginationBar(pageNumber, totalPages);
    }
}


// To ensure this only runs in browser
if (typeof window !== "undefined") {
    main();
}
