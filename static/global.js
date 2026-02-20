// Properties
export const SITE_NAME = "SourceSnippet";
export const SITE_MOTTO = "Come. Copy. Go. As simple as that!";
export const REPO_LINK = "https://github.com/sourcesnippet/sourcesnippet.github.io";
export const SITE_CREATION_TOOL = "https://www.npmjs.com/package/host-mdx"
export const SITE_DOMAIN = "https://sourcesnippet.github.io"
export const SITE_LOGO_PATH = "/static/logo.png"
export const PLACEHOLDER_IMG_PATH = "/static/placeholder.png"
export const PAGE_QUERY = "page";
export const TAGS_QUERY = "tags";
export const SEARCH_QUERY = "search";
export const PAGEFIND_PATH = "/static/search/pagefind.js"
export const STATS_FILE_PATH = "/static/data/_stats.json"
export const DATA_FILE_PATH_PREFIX = "/static/data/data-"
let pagefind;


// Methods
export function getPageNumFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const pageNumber = Number(urlParams.get(PAGE_QUERY)) || 1;
    return Math.max(pageNumber, 1);
}

export function getSearchQueryFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(SEARCH_QUERY) ?? "";
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


    console.log(
        "snippetsCount = ",snippetsCount,
        "| snippetsPerFile = ", snippetsPerFile,
        "| resultCount =", resultCount,
        "| totalFiles =", totalFiles, 
        "| remainderSnippets =", remainderSnippets, 
        "| deficitSnippets =", deficitSnippets, 
        "| skipFiles =", skipFiles, 
        "| skipIndex =", skipIndex
      );


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
            tags: { any: tags }
        }
    };
    const search = await pagefind.search(searchQuery, options);
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