import fs from "fs"
import path from "path"
import { parseHTML } from 'linkedom';
import { TAGS_QUERY } from "./static/global-script.js"
import * as pagefind from "pagefind";
import remarkHeadingId from 'remark-heading-id';
import rehypeMdxCodeProps from 'rehype-mdx-code-props'
import * as esbuild from 'esbuild';


// To Set Properties
const SNIPPETS_DIR = "/snippets/"
const SNIPPETS_INDEX_FILE = "index.mdx"
const SNIPPETS_PER_FILE = 5;
const SNIPPETS_DATA_DIR = "/static/data/"
const SNIPPETS_DATA_PREFIX = "data-"
const SNIPPETS_STATS_FILE = "_stats.json"
const INDEX_FOLDER = "/index"
const SNIPPETS_SEARCH_DIR = "/static/search/"
const UNTITLED_NAME = "Untitled"
const TAGS_FILE_PATH = "/tags/index.html"
const TAGS_CONTAINER_SELECTOR = "#tag-list-container"


// Properties
let snippetsList = []
let tagsSet = new Set();


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
function moveUpContents(folderPath) {

    // Get parent directory
    const targetDir = path.resolve(folderPath);
    const parentDir = path.dirname(targetDir);
    const items = fs.readdirSync(targetDir);


    // Move all items up to parent directory
    items.forEach((item) => {
        const oldPath = path.join(targetDir, item);
        const newPath = path.join(parentDir, item);
        fs.renameSync(oldPath, newPath);
    });


    // Remove the empty directory
    fs.rmdirSync(targetDir);
}
async function buildSearchIndex(outputPath) {

    // Add all records
    const { index } = await pagefind.createIndex();
    for (const snippet of snippetsList) {

        let title = snippet?.title ?? UNTITLED_NAME
        let thumbnail = snippet?.thumbnail ?? ""
        let tags = snippet?.tags ?? []
        let keyWords = snippet?.tags ?? []

        await index.addCustomRecord({
            url: snippet.url,
            content: `${title} ${tags.join(" ")} ${keyWords.join(" ")}`,
            language: "en",
            meta: { title, thumbnail, tags: tags.join(",") },
            filters: { tags: tags }
        });
    }


    // Save all records
    await index.writeFiles({
        outputPath: path.join(outputPath, SNIPPETS_SEARCH_DIR)
    });
}
function injectTags(outputPath) {

    // Read tags/index.html page
    const filePath = path.join(outputPath, TAGS_FILE_PATH);
    const htmlSource = fs.readFileSync(filePath, 'utf8');
    const { document } = parseHTML(htmlSource);


    // Return if no conainer found
    const container = document.querySelector(TAGS_CONTAINER_SELECTOR);
    if (!container) {
        return;
    }


    // Sort and group tags into [["a...", ...], ["b...", ...], ...]
    const sortedTags = Array.from(tagsSet).sort((a, b) => a.localeCompare(b)).reduce((accum, tag) => {
        const lastGroup = accum[accum.length - 1];
        if (lastGroup && lastGroup[0][0].toLowerCase() === tag[0].toLowerCase()) {
            lastGroup.push(tag);
        } else {
            accum.push([tag]);
        }
        return accum;
    }, []);


    // Generate html from tags
    const htmlContent = sortedTags.map(group => {
        const links = group.map(tag => `<a class="tag" href="/?${TAGS_QUERY}=${encodeURIComponent(tag)}">${tag}</a>`).join('');
        return `<div class="tag-list">${links}</div>`;
    }).join('\n\n');


    // Injecting html & save
    container.innerHTML = htmlContent;
    fs.writeFileSync(filePath, document.toString(), 'utf8');
}
async function compressFile(filePath) {
    const fileExt = path.extname(filePath).toLowerCase()
    if (fileExt === ".css") {
        const sourceCode = fs.readFileSync(filePath, 'utf8');
        const minified = await esbuild.transform(sourceCode, {
            loader: "css",
            charset: 'utf8',
            minify: true
        });
        fs.writeFileSync(filePath, minified.code);
    }
    else if (fileExt === ".js") {
        const sourceCode = fs.readFileSync(filePath, 'utf8');
        const minified = await esbuild.transform(sourceCode, {
            loader: "js",
            charset: 'utf8',
            minifyWhitespace: true,
            minifySyntax: true,
            minifyIdentifiers: false,
        });
        fs.writeFileSync(filePath, minified.code);
    }
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

export async function onFileCreateEnd(inputPath, outputPath, inFilePath, outFilePath, result) {

    // Compress file if js or css
    await compressFile(outFilePath);


    // Add to snippets list
    let absSnippetsDir = path.join(inputPath, SNIPPETS_DIR)
    let inputFileName = path.basename(inFilePath);
    if (result?.exports?.metaData && inputFileName == SNIPPETS_INDEX_FILE && isSubPath(absSnippetsDir, inFilePath)) {
        snippetsList.push({
            ...result?.exports?.metaData,
            url: `/${path.dirname(path.relative(inputPath, inFilePath))}/`
        });
    }


    // Add to tags set
    let tags = result?.exports?.metaData?.tags ?? []
    if (tags.length !== 0) {
        tags.forEach(item => tagsSet.add(item.toLowerCase()))
    }
}

export async function onSiteCreateEnd(inputPath, outputPath, wasInterrupted) {
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


    // Move up all files from index.js
    moveUpContents(path.join(outputPath, INDEX_FOLDER));


    // Create a search index
    await buildSearchIndex(outputPath);


    // Inject all tags in "/tags" page
    injectTags(outputPath);
}

export function toTriggerRecreate(event, path) {
    const isGOutputStream = /\.goutputstream-\w+$/.test(path);
    if (isGOutputStream) {
        return false;
    }

    return true;
}
