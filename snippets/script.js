console.log("hello world from snippets")

const snippetsPerPage = 100;

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
            if (snippetsPerPage <= snippets.length) {
                break;
            }

            snippets.push(data.snippets[j]);
        }


        // Reset so that next file being read isn't skipped
        skiptoIndex = 0;


        // If snippets summoned has exceeded required then break
        if (snippetsPerPage <= snippets.length) {
            break;
        }
    }

    console.log('Total snippets loaded:', snippets);
    return snippets;
}

// Execute the function
FetchSnippetsData(100);