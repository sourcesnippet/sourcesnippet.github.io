import fs from 'fs'
import path from 'path'
import http from 'http'
import { fork } from 'child_process'
import { MDX_ROOT_DIRECTORY, SITE_ROOT_DIRECTORY } from './createsite.js'


// Constants
const PORT = 3000
const CREATE_SITE_FILE = "./createsite.js"
const MIME_TYPE = {
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


// Functions
function invoke_create_site() {  // Runs create site script via fork
    // invoking create_site() directly does not properly update the site hence using fork instead 
    fork(CREATE_SITE_FILE) 
}
function watch_for_changes() {  // Watches MDX_ROOT_DIRECTORY files for any code change

    fs.watch(MDX_ROOT_DIRECTORY, { recursive: true }, (eventType, filename) => {

        if (eventType == "change") {
            console.log(`File Changed: ${filename}`)
            invoke_create_site()
        }

    })

}
function server_handle_req(req, res) {  // Handles incoming requests

    // Parse & Sanitize URL
    let parsed_url = new URL("http://" + req.headers.host + req.url)
    let sanitized_url = path.normalize(parsed_url.pathname).replace(/^(\.\.[\/\\])+/, '')
    let is_directory = !Boolean(path.parse(sanitized_url).ext)
    let relative_file_path = path.normalize(sanitized_url + (is_directory ? "/index.html" : ""))
    let absolute_file_path = path.join(SITE_ROOT_DIRECTORY, relative_file_path)
    let path_exists = fs.existsSync(absolute_file_path)

    // Responde with content of file
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
    else {
        res.statusCode = 404
        res.end(`404 Invalid url not found!`)
    }

}
function start_server() {  // Starts server at given port

    // Start Server
    const server = http.createServer(server_handle_req)
    server.listen(PORT, () => {
        console.log(`Watching for changes at directory "${MDX_ROOT_DIRECTORY}" & Listening at ${PORT} ...`)
    })

}


// Recreate site
invoke_create_site()


// Start server and watch for changes if flag is passed
watch_for_changes()
start_server()
