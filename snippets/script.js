// Properties
export const SNIPPETS_PER_PAGE = 100;
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
    let startFile = Math.trunc(skipCount / snippetsPerFile) + 1;
    let skiptoIndex = skipCount % snippetsPerFile;
    for (let i = startFile; i <= totalFiles; i++) {
        // Fetch snippets
        const dataResponse = await fetch(`${dataFilePathPrefix}${i}.json`);
        const data = await dataResponse.json();


        // Add fetched snippets to list
        console.log(skipCount % snippetsPerFile, data.snippets.length)
        for (let j = skiptoIndex; j < data.snippets.length; j++) {

            // Break if snippets required per page are exceeded
            if (SNIPPETS_PER_PAGE <= snippets.length) {
                break;
            }

            snippets.push(data.snippets[j]);
        }


        // Reset so that next file being read isn't skipped
        skiptoIndex = 0;


        // If snippets summoned has exceeded required then break
        if (SNIPPETS_PER_PAGE <= snippets.length) {
            break;
        }
    }

    console.log('Total snippets loaded:', snippets);
    return snippets;
}

async function RemoveChildren(element){
    while (element.firstChild) {
        element.removeChild(element.lastChild);
    }
}

export function addSnippetsToList(snippets, listElement, doc){
    // Add elements to list
    const fragment = doc.createDocumentFragment();
    for (let i = snippets.length - 1; i >= 0; i--){

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
    let snippets = await FetchSnippetsData();


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