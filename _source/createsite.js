import fs from 'node:fs'
import path from 'node:path'
import process from "node:process"
import { fileURLToPath, pathToFileURL } from 'node:url'
import { minify } from 'html-minifier'
import * as runtime from 'react/jsx-runtime'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { evaluate } from '@mdx-js/mdx'
import rehypeHighlight from "rehype-highlight";
import { common } from 'lowlight'
import gdscript from './highlight_additional/gdscript.js'


// Constants
export const ABS_SITE_ROOT_DIRECTORY = path.resolve("../")
export const ABS_MDX_ROOT_DIRECTORY = path.resolve("../_mdx")
export const ABS_STATIC_ROOT_DIRECTORY = path.resolve("../_static")
const ABS_SELF_ROOT_DIRECTORY = path.resolve()
const MDX_ROOT_FILE_URI = convert_to_file_uri(ABS_MDX_ROOT_DIRECTORY)
const WHITELIST_FILE_NAMES = [
    ".git",
    ".nojekyll",
    "ReadMe.md"
]
const WHITELIST_PATHS = [
    ABS_MDX_ROOT_DIRECTORY,
    ABS_STATIC_ROOT_DIRECTORY,
    ABS_SELF_ROOT_DIRECTORY
]


// Functions
function convert_to_file_uri(path_str) {  // Converts file into file uri i.e "file:///my/path/"
    return pathToFileURL(path.normalize(path.join(path_str, path.sep))).href
}
function make_path_url_safe(str) {  // Makes the given string safe to pass as url
    return str.toLowerCase().replaceAll(" ", "-")
}
function remove_old_directory() {  // Removes old site files

    // Removes any files and folder which are not whitelisted
    const files = fs.readdirSync(ABS_SITE_ROOT_DIRECTORY, { withFileTypes: true })
    files.forEach(file => {

        let delete_path = path.resolve(path.join(file.parentPath, file.name))
        const is_whitelisted = WHITELIST_FILE_NAMES.includes(file.name) || WHITELIST_PATHS.includes(delete_path)

        if (!is_whitelisted)
            fs.rmSync(delete_path, { recursive: true, force: true })

    })

}
async function mdx_to_html(mdx_code, base_url = MDX_ROOT_FILE_URI) {  // converts mdx code into html code

    const jsx = (await evaluate(mdx_code, {
        ...runtime,
        rehypePlugins: [[rehypeHighlight, { languages: { ...common, gdscript } }]],
        baseUrl: base_url
    })).default
    const html_code = renderToString(createElement(jsx))

    return minify(html_code, { minifyCSS: true })

}
async function create_html_file(mdx_file_path) {  // Creates a respective html file for the given mdx file

    try {

        // Exit if not of .mdx type
        if (!mdx_file_path.endsWith(".mdx"))
            return


        // Get Mdx dir path and file name without extension
        let mdx_dir_path = path.dirname(mdx_file_path)
        let mdx_path_parse = path.parse(mdx_file_path)
        let mdx_file_name = mdx_path_parse.name


        // Exit if private file
        if (mdx_file_name.startsWith("_"))
            return


        // To ensure "fs" working inside mdx
        process.chdir(mdx_dir_path);


        // Get new Html file path
        let relative_path = make_path_url_safe(path.relative(ABS_MDX_ROOT_DIRECTORY, mdx_dir_path))
        let html_file_name = make_path_url_safe(mdx_file_name + ".html")
        let html_path = path.join(ABS_SITE_ROOT_DIRECTORY, relative_path)
        let html_file_path = path.join(html_path, html_file_name)


        // Read the mdx file and create it's respective html file
        let mdx_code = fs.readFileSync(mdx_file_path, 'utf8')

        // Convert MDX to Html
        let html_code = await mdx_to_html(mdx_code)

        // Create directory
        if (!fs.existsSync(html_path))
            fs.mkdirSync(html_path, { recursive: true })


        // Write to file
        fs.writeFileSync(html_file_path, html_code)

    }
    catch (err) {
        console.log(`Error while creating Html page for "${path.relative(ABS_MDX_ROOT_DIRECTORY, mdx_file_path)}": ${err.stack}`)
    }

}
async function create_site_files(directory) {  // Recursively goes through mdx files and creates site html files

    try {

        // Adding new html files
        let files = fs.readdirSync(directory, { withFileTypes: true })


        // Iterate through all directories
        for (const file of files) {
            const file_path = path.join(directory, file.name)

            if (file.isFile())
                await create_html_file(path.resolve(file_path))

            else if (file.isDirectory())
                await create_site_files(file_path, false)

        }

    }
    catch (err) {

        console.log(`Error while creating site, Error: ${err.stack}`)

    }

}
async function create_site(directory = ABS_MDX_ROOT_DIRECTORY) {  // First Removes old site files, then creates new files

    // Removing old html files
    remove_old_directory()


    // Creating new html files
    await create_site_files(directory)


    // Recreate site Index to ensure proper site map
    const index_mdx_path = path.join(ABS_MDX_ROOT_DIRECTORY, "./index.mdx")
    if (fs.existsSync(index_mdx_path))
        create_html_file(index_mdx_path)
}


// Create Site 
let __filename = fileURLToPath(import.meta.url)
let entryFile = process.argv?.[1];

if (entryFile === __filename) {
    console.log("============= Recreating...   ===============")
    await create_site()
    console.log("============= Recreated Site! ===============")

    // Exit 
    process.exit()
}