// Properties
export const SNIPPETS_PER_PAGE = 3;
export const SNIPPET_LIST_ID = "#raw-snippet-list"


// Methods
async function FetchSnippetsData(skipCount = 0, statsFilePath = '/static/data/_stats.json', dataFilePathPrefix = "/static/data/data-") {
    // Retrieve the stats file
    const statsResponse = await fetch(statsFilePath);
    const stats = await statsResponse.json();
    const { snippetsCount, snippetsPerFile } = stats;


    // Setup variables
    let snippets = [];
    let totalFiles = Math.ceil(snippetsCount / snippetsPerFile);
    let remainderSnippets = snippetsCount % snippetsPerFile;
    let deficitSnippets = snippetsPerFile - remainderSnippets;
    let skipFiles = Math.trunc((skipCount + deficitSnippets) / snippetsPerFile);
    let skipIndex = (skipCount + deficitSnippets) % snippetsPerFile;


    // Iterate and fetch snippets
    for (let i = totalFiles - skipFiles - 1; 0 <= i && snippets.length < SNIPPETS_PER_PAGE; i--) {
        // Fetch snippets
        const dataResponse = await fetch(`${dataFilePathPrefix}${i}.json`);
        const data = await dataResponse.json();


        // Add fetched snippets to list
        for (let j = snippetsPerFile - skipIndex - 1; 0 <= j && snippets.length < SNIPPETS_PER_PAGE; j--) {
            console.log(data.snippets[j], j)
            snippets.push(data.snippets[j]);
        }


        // Reset skip index
        skipIndex = 0;
    }

    return snippets;
}

async function RemoveChildren(element) {
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

async function Main() {
    // Get all snippets
    let snippets = await FetchSnippetsData(2);


    // Clear list
    const listElement = document.querySelector(SNIPPET_LIST_ID);
    RemoveChildren(listElement);


    // Add to list
    addSnippetsToList(snippets, listElement, document);
}


// To ensure this only runs in browser
if (typeof window !== "undefined") {
    Main();
}