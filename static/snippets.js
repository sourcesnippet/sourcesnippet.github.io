// Properties
const SEARCH_INPUT_SELECTOR = "#searchbar .search-input"
const SEARCH_DROPDOWN_SELECTOR = "#searchbar .search-dropdown"
const SEARCH_MORE_SELECTOR = "#searchbar .search-more"
const SEARCH_NONEFOUND_SELECTOR = "#searchbar .search-nonefound"
const SEARCH_BTN_SELECTOR = "#searchbar .search-btn"


// Methods
function changeTab(element, index) {

    // Make sure index is a number
    index = parseInt(index)
    if (isNaN(index)) {
        return;
    }


    // Get content contains all code blocks
    let content = element?.parentNode?.parentNode;


    // Hide old code block
    let activeTab = content?.querySelector(".codetabs-active");
    activeTab?.classList?.remove("codetabs-active");


    // Activate new code block
    let preElement = element.parentNode.parentNode.querySelectorAll("pre");
    preElement?.[index]?.classList?.add("codetabs-active");
}

function changeTabByButton(element, index) {

    // Change tab based on index
    changeTab(element, index);


    // Remove old selected from button
    let selectedBtn = element?.parentNode?.querySelector(".codetabs-selected");
    selectedBtn?.classList?.remove("codetabs-selected");


    // Add selected to new button
    element.classList.add("codetabs-selected");
}

function copyCode(element) {
    // Get content contains all code blocks
    let content = element?.parentNode;
    let codeElement = content?.querySelector(".codetabs-active code");

    navigator.clipboard.writeText(codeElement?.innerText?.trim() ?? "");
}

async function main() {
    const paginationModule = await import("/pagination.js")
    paginationModule.setupSearch(
        undefined,
        undefined,
        {
            searchInput: SEARCH_INPUT_SELECTOR,
            searchDropdown: SEARCH_DROPDOWN_SELECTOR,
            searchMore: SEARCH_MORE_SELECTOR,
            searchNonefound: SEARCH_NONEFOUND_SELECTOR,
            searchBtn: SEARCH_BTN_SELECTOR,
        },
        false
    );

}

main();