import { getPageNumFromUrl, fetchSnippetsData, assignPaginationBtns } from "/static/pagination.js"


// Properties
export const RESULTS_PER_PAGE = 500;
export const SNIPPET_LIST_ID = "#raw-snippet-list"
export const PAGINATION_BAR_ID = "#pagination"


// Methods
function removeChildren(element) {
    while (element.firstChild) {
        element.removeChild(element.lastChild);
    }
}

export function addSnippetsToList(snippets, listElement, doc) {
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

export function updatePaginationBar(stats, pageNumber) {

    // Return if there aren't enough snippets to paginate
    if (stats.snippetsCount <= RESULTS_PER_PAGE) {
        return;
    }


    // Get pagination bar
    let paginationBar = document.querySelector(PAGINATION_BAR_ID);
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


    // Clear list
    const listElement = document.querySelector(SNIPPET_LIST_ID);
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
