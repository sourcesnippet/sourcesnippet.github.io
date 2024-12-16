import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as runtime from 'react/jsx-runtime'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { evaluate } from '@mdx-js/mdx'


// Constants
export const SITE_ROOT_DIRECTORY = path.resolve("../")
export const MDX_ROOT_DIRECTORY = path.resolve("../_mdx")
export const STATIC_ROOT_DIRECTORY = path.resolve("../_static")
const SELF_ROOT_DIRECTORY = path.resolve()
const WHITELIST_FILE_NAMES = [
    ".git",
    ".nojekyll",
    "ReadMe.md"
]
const WHITELIST_PATHS = [
    MDX_ROOT_DIRECTORY,
    STATIC_ROOT_DIRECTORY,
    SELF_ROOT_DIRECTORY
]


// Functions
function make_path_url_safe(str) {  // Makes the given string safe to pass as url
    return str.toLowerCase().replaceAll(" ", "-")
}
async function mdx_to_html(mdx_code) {  // converts mdx code into html code

    const base_url = "file:///" + MDX_ROOT_DIRECTORY + "/"
    const jsx = (await evaluate(mdx_code, { ...runtime, baseUrl: base_url })).default
    const html_code = renderToString(createElement(jsx))

    return html_code

}
function remove_old_directory() {  // Removed old site files

    // Removes any files and folder which are not whitelisted
    const files = fs.readdirSync(SITE_ROOT_DIRECTORY, { withFileTypes: true })
    files.forEach(file => {

        let delete_path = path.resolve(path.join(file.parentPath, file.name))
        const is_whitelisted = WHITELIST_FILE_NAMES.includes(file.name) || WHITELIST_PATHS.includes(delete_path)

        if (!is_whitelisted)
            fs.rmSync(delete_path, { recursive: true, force: true })

    })

}
function create_html_file(mdx_file_path) {  // Creates a respective html file for the given mdx file

    try {

        // Exit if not of .mdx type
        if (!mdx_file_path.endsWith("index.mdx"))
            return


        // Get Mdx dir path and file name without extension
        let dir_path = path.dirname(mdx_file_path)
        let path_parse = path.parse(mdx_file_path)
        let file_name = path_parse.name


        // Get new Html file path
        let relative_path = make_path_url_safe(path.relative(MDX_ROOT_DIRECTORY, dir_path))
        let html_file_name = make_path_url_safe(file_name + ".html")
        let html_path = path.join(SITE_ROOT_DIRECTORY, relative_path)
        let html_file_path = path.join(html_path, html_file_name)


        // Read the mdx file and create it's respective html file
        let data = fs.readFileSync(mdx_file_path, 'utf8')


        // Convert MDX to Html
        mdx_to_html(data).then(html_content => {

            // Create directory
            if (!fs.existsSync(html_path))
                fs.mkdirSync(html_path, { recursive: true })


            // Write to file
            fs.writeFileSync(html_file_path, html_content)


        }).catch(err => {
            console.log(`Error while creating Html page "${html_file_path}" for "${mdx_file_path}":\n${err.stack}`)
        })

    }
    catch (err) {
        console.log(`Could not create Html page for "${mdx_file_path}", Error: ${err.stack}`)
    }

}
function create_site_files(directory) {  // Recursively goes through mdx files and creates site html files

    try {

        // Adding new html files
        let files = fs.readdirSync(directory, { withFileTypes: true })


        // Iterate through all directories
        files.forEach(file => {

            const file_path = path.join(directory, file.name)

            if (file.isFile())
                create_html_file(path.resolve(file_path))

            else if (file.isDirectory())
                create_site_files(file_path, false)

        })

    }
    catch (err) {

        console.log(`Error while creating site, Error: ${err.stack}`)

    }

}
function create_site(directory = MDX_ROOT_DIRECTORY) {  // First Removes old site files, then creates new files

    // Removing old html files
    remove_old_directory()

    // Creating new html files
    create_site_files(directory)
}


// Create Site 
let __filename = fileURLToPath(import.meta.url)
let entryFile = process.argv?.[1];

if (entryFile === __filename) {
    console.log("============= Recreating Site... ===============")
    create_site()
}