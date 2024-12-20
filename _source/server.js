import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
import { fork } from 'node:child_process'
import { ABS_MDX_ROOT_DIRECTORY, ABS_SITE_ROOT_DIRECTORY } from './createsite.js'


// Constants
const PORT = 3000
const FILE_404 = path.resolve("../404.html")
const CREATE_SITE_FILE = "./createsite.js"  // File (relative to this file) which contains the script to create the entire site
const MIME_TYPE = {  // Maps extensions to mime protocol
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon',
    '.wav': 'audio/wav',
    '.webp': 'image/webp',
    '.mp3': 'audio/mpeg',
    '.mp4': 'video/mp4',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.zip': 'application/zip',
}
let is_creating_site = false  // Prevents site from being recreated if creation is ongoing


// Functions
function invoke_create_site(_recursive = false) {  // Runs create site script via fork since invoking create_site() directly does not properly update the site 

    // Exit if already creating
    if (is_creating_site)
        return


    // Set creating status to ongoing
    is_creating_site = true


    // Creating site
    fork(CREATE_SITE_FILE).addListener("close", () => { is_creating_site = false; })

}
async function watch_for_changes() {  // Watches ABS_MDX_ROOT_DIRECTORY files for any code change

    console.log(`Watching for changes at "${ABS_MDX_ROOT_DIRECTORY}" ...`);

    // Start watching files
    const watcher = Deno.watchFs(ABS_MDX_ROOT_DIRECTORY);
    for await (const event of watcher) {
        if (event.kind == "access")
            continue

        console.log(`File Changed: ${event.paths}`)
        invoke_create_site()
    }

}
function server_handle_req(req, res) {  // Handles incoming requests

    // Parse & Sanitize URL
    let parsed_url = new URL("http://" + req.headers.host + req.url)
    let sanitized_url = path.normalize(parsed_url.pathname).replace(/^(\.\.[\/\\])+/, '')
    let is_directory = !Boolean(path.parse(sanitized_url).ext)
    let relative_file_path = path.normalize(sanitized_url + (is_directory ? "/index.html" : ""))
    let absolute_file_path = path.join(ABS_SITE_ROOT_DIRECTORY, relative_file_path)
    let path_exists = fs.existsSync(absolute_file_path)


    // 404 file
    if (!path_exists) {
        absolute_file_path = FILE_404
        path_exists = fs.existsSync(absolute_file_path)
    }


    // Respondes with content of file
    if (path_exists)
        // read file from file system
        fs.readFile(absolute_file_path, function (err, data) {
            if (err) {
                res.statusCode = 500
                res.end(`Error getting the file: ${err}.`)
            }
            else {
                // Based on the URL path, extract the file extention. e.g. .js, .doc, ...
                const ext = path.parse(absolute_file_path).ext
                res.setHeader('Content-type', MIME_TYPE[ext] || 'text/plain') // if the file is found, set Content-type and send data
                res.end(data)
            }

        })
    else { // Respondes with 404 if file not found
        res.statusCode = 404
        res.end(`404 Invalid url not found!`)
    }

}
function start_server(port = PORT) {  // Starts server at given port

    // Start Server
    const server = http.createServer(server_handle_req)
    server.listen(port, () => {
        console.log(`Server Created & Listening at ${PORT} ...`)
    })

}


// Recreate site
invoke_create_site()


// Start server and watch for changes if flag is passed
watch_for_changes()
start_server()
