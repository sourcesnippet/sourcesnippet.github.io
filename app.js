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


const ROOT_DIRECTORY = path.resolve("./site")
const MDX_ROOT_FILE_URI = convert_to_file_uri(ROOT_DIRECTORY)


// Functions
function convert_to_file_uri(path_str) {  // Converts file into file uri i.e "file:///my/path/"
    return pathToFileURL(path.normalize(path.join(path_str, path.sep))).href
}
async function mdx_to_html(mdx_code, base_url = MDX_ROOT_FILE_URI) {  // converts mdx code into html code

    const jsx = (await evaluate(mdx_code, {
        ...runtime,
        rehypePlugins: [[rehypeHighlight, { languages: { ...common, gdscript } }]],
        baseUrl: base_url
    })).default
    const html_code = "<!DOCTYPE html>" + renderToString(createElement(jsx))

    return minify(html_code, { minifyCSS: true })

}
async function create_site() {
    // Iterate through files
    let files = fs.readdirSync(ROOT_DIRECTORY, { withFileTypes: true, recursive: true });

    for (const file of files) {
        const file_path = path.join(file.parentPath, file.name)

        if (file.isFile() && file_path.endsWith(".mdx")) {


            // To ensure file paths work
            process.chdir(file.parentPath);


            let mdx_code = fs.readFileSync(file_path, 'utf8');
            let html_code = await mdx_to_html(mdx_code);

            fs.writeFileSync(file_path.replace(".mdx", ".html"), html_code);
        }

    }
}
async function remove_mdx_files() {

    // Iterate through files
    let files = fs.readdirSync(ROOT_DIRECTORY, { withFileTypes: true, recursive: true });

    for (const file of files) {
        const file_path = path.join(file.parentPath, file.name)

        if (file.isFile() && file.name.endsWith(".mdx")) {
            fs.rmSync(file_path, { force: true });
        }

    }
}


// Add .nojekyll
fs.writeFileSync(path.join(ROOT_DIRECTORY, ".nojekyll"), "");


// Intentionally creating twice for site guide
await create_site();
await create_site();


// Remove mdx files
await remove_mdx_files()


// exit idk why it doesn't exit on it's own
process.exit()
