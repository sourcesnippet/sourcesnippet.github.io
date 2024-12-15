import fs from 'fs';
import path from 'path';
import * as runtime from 'react/jsx-runtime'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { evaluate } from '@mdx-js/mdx'


// Constants
const mdx_root_directory = "./mdx";
const site_root_directory = "../";
const whitelist_folders = [".git", ".nojekyll"]
const self_dir = path.basename(import.meta.dirname)


// Functions
async function mdx_to_html(mdx_code) {  // converts mdx code into html code

    var base_url = import.meta.url // path.join(import.meta.dirname,"mdx");
    const jsx = (await evaluate(mdx_code, { ...runtime, baseUrl: base_url })).default
    const html_code = renderToString(createElement(jsx));

    return html_code;

}
function remove_old_directory() {  // Removed old site files

    const files = fs.readdirSync(site_root_directory, { withFileTypes: true })


    // Removes any folder which is not self and not in whitelist
    files.forEach(file => {

        const is_whitelisted = whitelist_folders.includes(file.name)
        const is_self = file.name === self_dir

        if (!is_whitelisted && !is_self) {
            let delete_path = path.join(file.parentPath, file.name)
            fs.rmSync(delete_path, { recursive: true, force: true });
        }
    });

}
function create_html_file(mdx_file_path) {  // Creates a respective html file for the given mdx file

    try {

        // Get Mdx dir path and file name without extension
        let dir_path = path.dirname(mdx_file_path)
        let path_parse = path.parse(mdx_file_path)
        let file_name = path_parse.name


        // Exit if not of .mdx type
        if (path_parse.ext !== ".mdx")
            return false;


        // Exit if private
        if (file_name.startsWith("_"))
            return false


        // Get new Html file path
        let relative_path = path.relative(mdx_root_directory, dir_path);
        let html_file_name = file_name + ".html";
        let html_path = path.join(site_root_directory, relative_path).toLowerCase()
        let html_file_path = path.join(html_path, html_file_name).toLowerCase();


        // Read the mdx file and create it's respective html file
        let data = fs.readFileSync(mdx_file_path, 'utf8');


        // Convert MDX to Html
        mdx_to_html(data).then(html_content => {

            // Create directory
            if (!fs.existsSync(html_path)) {
                fs.mkdirSync(html_path, { recursive: true });
            }

            // Write to file
            fs.writeFileSync(html_file_path, html_content);

        })

        return true;
    }
    catch (err) {
        console.log(`Could not create Html page for "${mdx_file_path}", Error: ${err.stack}`)
        return false;
    }

}
function create_site_files(directory) {  // Recursively goes through mdx files and creates site html files

    try {

        // Adding new html files
        let files = fs.readdirSync(directory, { withFileTypes: true })


        // Iterate through all directories
        files.forEach(file => {

            const file_path = path.join(directory, file.name);

            if (file.isFile()) {
                create_html_file(file_path);
            }
            else if (file.isDirectory() && file.name != self_dir) {
                create_site_files(file_path, false);
            }

        });
    }
    catch (err) {
        console.log(`Error while creating site, Error: ${err.stack}`)
    }

}
function create_site(directory = mdx_root_directory) {  // First Removes old site files, then creates new files

    // Removing old html files
    remove_old_directory()

    // Creating new html files
    create_site_files(directory);
}


// Create Site 
create_site()
console.log("Recreated Site!")