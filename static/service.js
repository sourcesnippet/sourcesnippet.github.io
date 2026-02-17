// Properties
export const PAGE_QUERY = "page";
export const TAGS_QUERY = "tags";
export const SEARCH_QUERY = "search";
export const STATS_FILE_PATH = "/static/data/_stats.json"
export const DATA_FILE_PATH_PREFIX = "/static/data/data-"
export const PAGEFIND_PATH = "/static/search/pagefind.js"
let pagefind;


// Methods
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
export function gotoPage(pageNumber) {
    const url = new URL(window.location.href);
    url.searchParams.set(PAGE_QUERY, pageNumber);
    window.location.href = url.toString();
}
async function fetchDefaultSnippets(resultCount, skipCount = 0) {
    // Get stats
    const statsResponse = await fetch(STATS_FILE_PATH);
    const stats = await statsResponse.json();


    // Setup variables
    const { snippetsCount, snippetsPerFile } = stats;
    let snippets = [];
    let totalFiles = Math.ceil(snippetsCount / snippetsPerFile);
    let remainderSnippets = snippetsCount % snippetsPerFile;
    let deficitSnippets = snippetsPerFile - remainderSnippets;
    let skipFiles = Math.trunc((skipCount + deficitSnippets) / snippetsPerFile);
    let skipIndex = (skipCount + deficitSnippets) % snippetsPerFile;


    // Iterate and fetch snippets
    for (let i = totalFiles - skipFiles - 1; 0 <= i && snippets.length < resultCount; i--) {

        // Fetch snippets
        const dataResponse = await fetch(`${DATA_FILE_PATH_PREFIX}${i}.json`);
        const data = await dataResponse.json();


        // Add fetched snippets to list
        for (let j = snippetsPerFile - skipIndex - 1; 0 <= j && snippets.length < resultCount; j--) {
            snippets.push(data.snippets[j]);
        }


        // Reset skip index
        skipIndex = 0;
    }

    return {
        snippets,  // Snippets data within resultCount
        totalSnippets: snippetsCount   // Total available snippets
    };
}
export async function fetchSnippets(searchQuery, tags = [], resultCount, skipCount = 0) {

    // fetch default snippets if no query is provided
    if (!searchQuery && tags.length == 0) {
        return fetchDefaultSnippets(resultCount, skipCount);
    }


    // Init pagefind if not already assigned
    if (!pagefind) {
        pagefind = await import(PAGEFIND_PATH);
        await pagefind.init();
    }


    // Get search results & store in snippets
    let snippets = []
    let options = tags.length == 0 ? {} : {
        filters: {
            tags: {
                any: tags
            }
        }
    };

    console.log(options);
    const search = await pagefind.search(searchQuery, options);
    console.log(search);
    for (let i = skipCount; i < resultCount + skipCount; i++) {

        // Break if exceeded number of snippets found
        if (search.results.length <= i) {
            break;
        }


        // Add to snippets list
        let data = await search.results[i].data();
        snippets.push({
            url: data?.url ?? "#",
            title: data?.meta?.title ?? "",
            thumbnail: data?.meta?.thumbnail ?? "",
            tags: data?.meta?.tags?.split(",").filter(Boolean) ?? []
        });
    }


    return { snippets, totalSnippets: search.results.length };
}
export function setupPaginationBtns(paginationBar, currentIndex, totalIndices) {

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
    prevBtn.onclick = toShowPrev ? () => { gotoPage(currentIndex - 1) } : null;


    // Page 1 button
    let toShowPage1 = (4 <= currentIndex);
    page1.style.display = toShowPage1 ? "" : "none";
    page1.onclick = toShowPage1 ? () => { gotoPage(1) } : null;
    page1.textContent = toShowPage1 ? 1 : "-";


    // Start Dots 
    let toShowStartDots = (5 <= currentIndex);
    startDots.style.display = toShowStartDots ? "" : "none";


    // Page 4 button
    let toShowPage4 = (3 <= currentIndex);
    page4.style.display = toShowPage4 ? "" : "none";
    page4.onclick = toShowPage4 ? () => { gotoPage(currentIndex - 2) } : null;
    page4.textContent = toShowPage4 ? currentIndex - 2 : "-";


    // Page 5 button
    let toShowPage5 = (2 <= currentIndex);
    page5.style.display = toShowPage5 ? "" : "none";
    page5.onclick = toShowPage5 ? () => { gotoPage(currentIndex - 1) } : null;
    page5.textContent = toShowPage5 ? currentIndex - 1 : "-";


    // Active button
    pageActiveBtn.textContent = currentIndex;


    // Page 7 button
    let toShowPage7 = (totalIndices >= currentIndex + 1);
    page7.style.display = toShowPage7 ? "" : "none";
    page7.onclick = toShowPage7 ? () => { gotoPage(currentIndex + 1) } : null;
    page7.textContent = toShowPage7 ? currentIndex + 1 : "-";


    // Page 8 button
    let toShowPage8 = (totalIndices >= currentIndex + 2);
    page8.style.display = toShowPage8 ? "" : "none";
    page8.onclick = toShowPage8 ? () => { gotoPage(currentIndex + 2) } : null;
    page8.textContent = toShowPage8 ? currentIndex + 2 : "-";


    // Ending Dots
    let toShowEndDots = (currentIndex < totalIndices - 3);
    endDots.style.display = toShowEndDots ? "" : "none";


    // Page 11 button
    let toShowPage11 = (currentIndex < totalIndices - 2);
    page11.style.display = toShowPage11 ? "" : "none";
    page11.onclick = toShowPage11 ? () => { gotoPage(totalIndices) } : null;
    page11.textContent = toShowPage11 ? totalIndices : "-";


    // Next button
    let toShowNext = (currentIndex != totalIndices);
    nextBtn.style.display = toShowNext ? "" : "none";
    nextBtn.onclick = toShowNext ? () => { gotoPage(currentIndex + 1) } : null;
}