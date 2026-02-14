import fs from "fs"
import path from "path"
import remarkHeadingId from 'remark-heading-id';
import rehypeMdxCodeProps from 'rehype-mdx-code-props'
import { parseHTML } from 'linkedom';
import { SNIPPETS_PER_PAGE, SNIPPET_LIST_ID, addSnippetsToList } from "./snippets/script.js"


// To Set Properties
const SNIPPETS_DIR = "/snippets/"
const SNIPPETS_INDEX_FILE = "index.mdx"
const SNIPPETS_PER_FILE = 5;
const SNIPPETS_DATA_DIR = "/static/data/"
const SNIPPETS_DATA_PREFIX = "data-"
const SNIPPETS_STATS_FILE = "_stats.json"
const SNIPPETS_ALL_FILE = "/snippets/index.html"


// Properties
let snippetsList = []


// Utility Methods
function stripTrailingSep(thePath) {
    if (thePath[thePath.length - 1] === path.sep) {
        return thePath.slice(0, -1);
    }
    return thePath;
}
function isSubPath(potentialParent, thePath) {
    // For inside-directory checking, we want to allow trailing slashes, so normalize.
    thePath = stripTrailingSep(thePath);
    potentialParent = stripTrailingSep(potentialParent);


    // Node treats only Windows as case-insensitive in its path module; we follow those conventions.
    if (process.platform === "win32") {
        thePath = thePath.toLowerCase();
        potentialParent = potentialParent.toLowerCase();
    }


    return thePath.lastIndexOf(potentialParent, 0) === 0 &&
        (
            thePath[potentialParent.length] === path.sep ||
            thePath[potentialParent.length] === undefined
        );
}


// Primary Methods
function createNojekyll(outputPath) {
    fs.writeFileSync(path.join(outputPath, '.nojekyll'), "");
}
function createSnippetsData(outputPath) {
    // Create data folder
    let absDataDir = path.join(outputPath, SNIPPETS_DATA_DIR);
    if (!fs.existsSync(absDataDir)) {
        fs.mkdirSync(absDataDir);
    }


    // Create site data.json files
    for (let i = 0; i < snippetsList.length; i += SNIPPETS_PER_FILE) {
        const chunk = snippetsList.slice(i, i + SNIPPETS_PER_FILE);
        const jsonContent = JSON.stringify({ snippets: chunk });
        const fileNumber = i / SNIPPETS_PER_FILE;
        const fileName = `${SNIPPETS_DATA_PREFIX}${fileNumber}.json`;
        fs.writeFileSync(path.join(absDataDir, fileName), jsonContent);
    }


    // Create stats file
    let stats = {
        snippetsCount: snippetsList.length,
        snippetsPerFile: SNIPPETS_PER_FILE
    }
    fs.writeFileSync(path.join(outputPath, SNIPPETS_DATA_DIR, SNIPPETS_STATS_FILE), JSON.stringify(stats));
}
function injectDefaultDataIntoPrimary(outputPath) {
    // Get Html
    const htmlFilePath = path.join(outputPath, SNIPPETS_ALL_FILE)
    const html = fs.readFileSync(htmlFilePath, 'utf-8');
    const { document } = parseHTML(html);


    // Skip if list container not found
    const listElement = document.querySelector(SNIPPET_LIST_ID);
    if (!listElement) {
        return;
    }


    // Add all snippets
    addSnippetsToList(snippetsList, listElement, document);


    // Update file
    fs.writeFileSync(htmlFilePath, document.toString());
}


// Override Methods
export function modBundleMDXSettings(inputPath, outputPath, settings) {

    // Build options
    var oldBuildOptions = settings.esbuildOptions;
    settings.esbuildOptions = (options) => {
        options = oldBuildOptions(options)
        options.alias = {
            ...options.alias,
            '@': inputPath, // Maps '@' to your project root
        };

        return options;
    }


    // mdx options
    var oldMdxOptions = settings.mdxOptions;
    settings.mdxOptions = (options) => {
        options = oldMdxOptions(options);
        options.remarkPlugins = [
            ...(options.remarkPlugins ?? []),
            [remarkHeadingId, { defaults: true }],
        ];
        options.rehypePlugins = [
            ...(options.rehypePlugins ?? []),
            [rehypeMdxCodeProps, { tagName: 'code' }]
        ]

        return options
    }


    return settings
}

export function onSiteCreateStart(inputPath, outputPath) {
    snippetsList = [];
}

export function onFileCreateEnd(inputPath, outputPath, inFilePath, outFilePath, result) {
    let absSnippetsDir = path.join(inputPath, SNIPPETS_DIR)
    let inputFileName = path.basename(inFilePath);
    if (result?.exports?.metaData && inputFileName == SNIPPETS_INDEX_FILE && isSubPath(absSnippetsDir, inFilePath)) {
        snippetsList.push({
            ...result?.exports?.metaData,
            url: `/${path.dirname(path.relative(inputPath, inFilePath))}/`
        });
    }
}

export function onSiteCreateEnd(inputPath, outputPath, wasInterrupted) {
    // Return if site was interrupted while creating
    if (wasInterrupted) {
        return;
    }


    // Create .nojekyll
    createNojekyll(outputPath)


    // Sort snippets
    snippetsList.sort((a, b) => {
        // Sort by Date
        const dateA = a.createdOnDate instanceof Date ? a.createdOnDate.getTime() : 0;
        const dateB = b.createdOnDate instanceof Date ? b.createdOnDate.getTime() : 0;
        if (dateA !== dateB) {
            return dateA - dateB;
        }


        // Fallback sort by title
        const titleA = (a.title || "").toLowerCase();
        const titleB = (b.title || "").toLowerCase();
        return titleB.localeCompare(titleA);
    });


    // Create data.json & _stats.json file for all snippets
    createSnippetsData(outputPath);


    // Inject default data into /all
    // injectDefaultDataIntoPrimary(outputPath);
}

export function toTriggerRecreate(event, path) {
    const isGOutputStream = /\.goutputstream-\w+$/.test(path);
    if (isGOutputStream) {
        return false;
    }

    return true;
}
