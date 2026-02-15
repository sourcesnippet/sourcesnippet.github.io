import { getPageNumFromUrl, fetchSnippetsData, assignPaginationBtns, gotoPage } from "/static/pagination.js"


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


// Methods
export function updateSnippetCards(snippets) {

    // Iterate over all snippet cards
    const snippetCards = document.querySelectorAll(SNIPPET_CARD_SELECTOR);
    for (let i = 0; i < snippetCards.length; i++) {

        // Remove loading class
        const card = snippetCards[i];
        card.classList.remove(SNIPPET_LOADING_CLASS);


        console.log(snippets.length, i, CARDS_PER_ROW)

        // Hide/Remove card if no more snippets left
        if (snippets.length <= i && i < CARDS_PER_ROW) {
            console.log("hidding")
            card.style.visibility = "hidden";
            continue;
        }
        else if (snippets.length <= i) {
            console.log("removing")
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
            const tagElement = document.createElement('a');
            tagElement.href = '#';
            tagElement.className = SNIPPET_TAG_CLASS;
            tagElement.textContent = tags[i];
            tagContainer.appendChild(tagElement);
        }
    }
}

export function updatePaginationBar(stats, pageNumber) {

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

async function main() {

    // Get page number
    const pageNumber = getPageNumFromUrl();


    // Get all snippets based on page number
    const { stats, snippets } = await fetchSnippetsData(RESULTS_PER_PAGE, RESULTS_PER_PAGE * (pageNumber - 1));


    // Redirect to last page if exceeded limit
    let totalPages = Math.ceil(stats.snippetsCount / RESULTS_PER_PAGE);
    if (totalPages < pageNumber) {
        gotoPage(totalPages);
        return;
    }


    // Redirect to first page if lower than 1
    if (pageNumber <= 0) {
        gotoPage(1);
        return;
    }


    // Add snippet data to all cards
    updateSnippetCards(snippets);


    // Update pagination bar
    updatePaginationBar(stats, pageNumber);
}


// To ensure this only runs in browser
if (typeof window !== "undefined") {
    main();
}
