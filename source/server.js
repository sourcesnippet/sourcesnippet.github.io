import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import { fork } from 'child_process';


// Constants
const PORT = 3000;
const MDX_ROOT_DIRECTORY = "./mdx";
const SITE_ROOT_DIRECTORY = "./site";
const STATIC_FOLDER = "static"
const CREATE_SITE_FILE = "createsite.js"
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
};
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// Functions
function inside_directory(dir, path_name) {
    let combined_path = path.join(__dirname, dir, path_name);
    let path_exists = fs.existsSync(combined_path)
    return path_exists;
}
function invoke_create_site() {
    fork(CREATE_SITE_FILE);
}
function watch_for_changes() {  // Watches mdx files for any code change

    fs.watch("mdx/", { recursive: true }, (eventType, filename) => {

        if (eventType == "change") {
            console.log(`File Changed: ${filename}, Recreating site...`)
            invoke_create_site();
        }

    });

}
function server_handle_req(req, res) {

    // Parse & Sanitize URL
    let parsed_url = new URL("http://" + req.headers.host + req.url);
    let sanitized_path = path.normalize(parsed_url.pathname).replace(/^(\.\.[\/\\])+/, '');
    let final_path = ""


    // Get inside which directory
    let subdir_array = sanitized_path.split("/")
    let is_static = subdir_array[1] === STATIC_FOLDER
    let is_path_directory = !Boolean(path.parse(sanitized_path).ext)
    let is_inside_static = inside_directory("./", sanitized_path)
    let is_inside_site = is_static ? false : inside_directory(SITE_ROOT_DIRECTORY, sanitized_path)


    // If inside site folder
    if (is_static && is_inside_static) {
        final_path = path.join("./", sanitized_path) //path.join(static_root_directory, sanitized_path);
    }

    // If inside site
    else if (is_inside_site) {
        final_path = path.join(SITE_ROOT_DIRECTORY, sanitized_path, is_path_directory ? "/index.html" : "");
    }


    // Responde with content of file
    if (fs.existsSync(final_path))
        // read file from file system
        fs.readFile(final_path, function (err, data) {
            if (err) {
                res.statusCode = 500;
                res.end(`Error getting the file: ${err}.`);
            }
            else {
                // Based on the URL path, extract the file extention. e.g. .js, .doc, ...
                const ext = path.parse(final_path).ext;
                res.setHeader('Content-type', MIME_TYPE[ext] || 'text/plain'); // if the file is found, set Content-type and send data
                res.end(data);
            }

        });
    else {
        res.statusCode = 404;
        res.end(`404 Invalid url not found!`);
    }

}
function start_server() {

    // Start Server
    const server = http.createServer(server_handle_req);
    server.listen(PORT, () => {
        console.log(`Watching for changes at directory "${MDX_ROOT_DIRECTORY}" & Listening at ${PORT} ...`)
    });

}

// Rereate site
invoke_create_site()

// Start server and watch for changes if flag is passed
watch_for_changes()
start_server()
