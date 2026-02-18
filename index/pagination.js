import { fetchSnippets } from "/static/service.js"
import { PAGE_QUERY, TAGS_QUERY, SEARCH_QUERY } from "/static/global-script.js"


// Properties
export const QUICK_SEARCH_DELAY = 300;  // Amount to wait before quick searching
export const DEFAULT_QUICK_SEARCH_COUNT = 5;
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

export function getPageNumFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const pageNumber = Number(urlParams.get(PAGE_QUERY)) || 1;
    return Math.max(pageNumber, 1);
}

export function getSearchQueryFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(SEARCH_QUERY);
}

export function getTagsQueryFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    let tagsString = urlParams.get(TAGS_QUERY)
    return tagsString?.split(",").filter(Boolean) ?? [];
}

export function gotoPageNumber(pageNumber) {
    const url = new URL(window.location.href);
    url.searchParams.set(PAGE_QUERY, pageNumber);
    window.location.href = url.toString();
}

function setupPaginationBtns(paginationBar, currentIndex, totalIndices) {

    // Get all elements in pagination bar
    let prevBtn = paginationBar.querySelector(".pagination-prev");
    let page1 = paginationBar.querySelector(".pagination-item:nth-of-type(2)"); // Intentionall not :nth-of-type(1) DO NOT CHANGE
    let startDots = paginationBar.querySelector(".pagination-dots:nth-of-type(1)");
    let page4 = paginationBar.querySelector(".pagination-item:nth-of-type(3)");
    let page5 = paginationBar.querySelector(".pagination-item:nth-of-type(4)");
    let pageActiveBtn = paginationBar.querySelector(".pagination-active");
    let page7 = paginationBar.querySelector(".pagination-item:nth-of-type(6)");
    let page8 = paginationBar.querySelector(".pagination-item:nth-of-type(7)");
    let endDots = paginationBar.querySelector(".pagination-dots:nth-of-type(2)");
    let page11 = paginationBar.querySelector(".pagination-item:nth-of-type(8)");
    let nextBtn = paginationBar.querySelector(".pagination-next");


    // Prev Button
    let toShowPrev = (currentIndex != 1);
    prevBtn.style.display = toShowPrev ? "" : "none"
    prevBtn.onclick = toShowPrev ? () => { gotoPageNumber(currentIndex - 1) } : null;


    // Page 1 button
    let toShowPage1 = (4 <= currentIndex);
    page1.style.display = toShowPage1 ? "" : "none";
    page1.onclick = toShowPage1 ? () => { gotoPageNumber(1) } : null;
    page1.textContent = toShowPage1 ? 1 : "-";


    // Start Dots 
    let toShowStartDots = (5 <= currentIndex);
    startDots.style.display = toShowStartDots ? "" : "none";


    // Page 4 button
    let toShowPage4 = (3 <= currentIndex);
    page4.style.display = toShowPage4 ? "" : "none";
    page4.onclick = toShowPage4 ? () => { gotoPageNumber(currentIndex - 2) } : null;
    page4.textContent = toShowPage4 ? currentIndex - 2 : "-";


    // Page 5 button
    let toShowPage5 = (2 <= currentIndex);
    page5.style.display = toShowPage5 ? "" : "none";
    page5.onclick = toShowPage5 ? () => { gotoPageNumber(currentIndex - 1) } : null;
    page5.textContent = toShowPage5 ? currentIndex - 1 : "-";


    // Active button
    pageActiveBtn.textContent = currentIndex;


    // Page 7 button
    let toShowPage7 = (totalIndices >= currentIndex + 1);
    page7.style.display = toShowPage7 ? "" : "none";
    page7.onclick = toShowPage7 ? () => { gotoPageNumber(currentIndex + 1) } : null;
    page7.textContent = toShowPage7 ? currentIndex + 1 : "-";


    // Page 8 button
    let toShowPage8 = (totalIndices >= currentIndex + 2);
    page8.style.display = toShowPage8 ? "" : "none";
    page8.onclick = toShowPage8 ? () => { gotoPageNumber(currentIndex + 2) } : null;
    page8.textContent = toShowPage8 ? currentIndex + 2 : "-";


    // Ending Dots
    let toShowEndDots = (currentIndex < totalIndices - 3);
    endDots.style.display = toShowEndDots ? "" : "none";


    // Page 11 button
    let toShowPage11 = (currentIndex < totalIndices - 2);
    page11.style.display = toShowPage11 ? "" : "none";
    page11.onclick = toShowPage11 ? () => { gotoPageNumber(totalIndices) } : null;
    page11.textContent = toShowPage11 ? totalIndices : "-";


    // Next button
    let toShowNext = (currentIndex != totalIndices);
    nextBtn.style.display = toShowNext ? "" : "none";
    nextBtn.onclick = toShowNext ? () => { gotoPageNumber(currentIndex + 1) } : null;
}

function loadingQueryBanner(queries = {}, selectors = {}) {

    // Return if no queries
    if (!queries.searchQuery && queries.tags.length == 0) {
        return;
    }


    // Return if banner not found
    let queryBannerElement = document.querySelector(selectors.queryBanner);
    if (!queryBannerElement) {
        return;
    }


    // Make sure banner is visible
    queryBannerElement.style.display = ""


    // Write as loading
    queryBannerElement.textContent = "Loading..."
}

function assignQueryBanner(resultCount = 0, queries = {}, selectors = {}) {

    console.log("here")

    // Return if no queries
    if (!queries.searchQuery && queries.tags.length == 0) {
        console.log("returning")

        return;
    }


    // Return if banner not found
    let queryBannerElement = document.querySelector(selectors.queryBanner);
    if (!queryBannerElement) {
        return;
    }


    // Make sure banner is visible
    queryBannerElement.style.display = ""


    // Write into banner based on queries
    let queryText = `${resultCount} ${resultCount == 1 ? "result" : "results"}`;
    queryText += queries.searchQuery ? ` for "${queries.searchQuery}"` : "";
    queryText += queries.tags.length != 0 ? ` with ${queries.tags.length == 1 ? "tag" : "tags"} ${queries.tags.map(i => `[ ${i} ]`).join(" ")}` : "";


    // Assign into query Banner
    queryBannerElement.textContent = queryText;
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
        dropdownElement.insertBefore(anchor, searchMoreElement);
    });

}

export function setupSearch(searchQuery = "", quickSearchCount = DEFAULT_QUICK_SEARCH_COUNT, selectors = {}) {
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
        window.location.href = query ? `/?${SEARCH_QUERY}=${encodeURIComponent(query)}` : window.location.pathname;
    };
    const quickSearch = debounce(async () => {
        // Set new search id
        const thisSearchId = ++lastSearchId;


        // Get search results
        const query = searchInput.value;
        const quickSearchResults = (query === "") ? [] : (await fetchSnippets(query, [], quickSearchCount + 1)).snippets;
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

    // Get url queries 
    const urlQueries = {
        searchQuery: getSearchQueryFromUrl(),
        pageNumber: getPageNumFromUrl(),
        tags: getTagsQueryFromUrl()
    }


    // Setup search functionality on page
    setupSearch(urlQueries.searchQuery, quickSearchCount, selectors);


    // Set search to loading
    loadingQueryBanner(urlQueries, selectors);


    // Get all snippets based on page number & search query
    const { snippets, totalSnippets } = await fetchSnippets(urlQueries.searchQuery, urlQueries.tags, resultsPerPage, resultsPerPage * (urlQueries.pageNumber - 1));


    // Display what was queried
    assignQueryBanner(totalSnippets, urlQueries, selectors);


    // Add snippet data to all cards
    substanceCallback(snippets);


    // Setup pagination bar only if there are enough snippets to paginate
    if (resultsPerPage < totalSnippets) {
        const totalPages = 0 < totalSnippets ? Math.ceil(totalSnippets / resultsPerPage) : 1;
        let paginationBar = document.querySelector(selectors.paginationBar);
        paginationBar.style.display = "";  // Ensure pagination bar is visible
        setupPaginationBtns(paginationBar, urlQueries.pageNumber, totalPages);
    }
}
