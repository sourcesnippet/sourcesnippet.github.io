import React from "npm:react"
import path from "node:path"
import fs from "node:fs"
import { Fragment } from "npm:react"


// Site Guide Structure = { <Url>: { <Title>, <Category> }, ... }


// Constants
export const SiteName = "SourceSnippet" // Stores the name of the site
const STATIC_CODE_STYLE_URL = "/_static/codestyle.css"  // Static URL of css for code styling
const MDX_ROOT_DIRECTORY = "./"  // path to mdx root directory, relative to this file's location
const SITE_GUIDE_PATH = "../_static/siteguide.json"  // path to site guide, relative to this file's location
const ABS_MDX_ROOT_DIRECTORY = path.join(import.meta.dirname, MDX_ROOT_DIRECTORY)  // path to mdx root directory, absolute location
const ABS_SITE_GUIDE_PATH = path.resolve(path.join(import.meta.dirname, SITE_GUIDE_PATH))  // path to site guide, absolute location
let GuideGenerationCount = 0  // Keeps count of guide generation, deletes old guide.json if being generated for the first time


// Functions
function get_mdx_url(mdx_path) { // Get the mdx file path converted into site url

    const abs_mdx_root = ABS_MDX_ROOT_DIRECTORY
    const relative_mdx_path = path.relative(abs_mdx_root, mdx_path)
    const mdx_url = path.join("/", relative_mdx_path, "/")
    const mdx_url_safe = mdx_url.toLowerCase().replaceAll(" ", "-")

    return mdx_url_safe
}
function guide_register(Category, Title) {  // Register data into guide.json


    // Remove old Site Guide
    if (GuideGenerationCount === 0) {
        if (fs.existsSync(ABS_SITE_GUIDE_PATH))
            fs.unlinkSync(ABS_SITE_GUIDE_PATH);
    }
    GuideGenerationCount += 1


    // Modify site guide
    let site_guide_json = {}
    let abs_site_guide_dir = path.dirname(ABS_SITE_GUIDE_PATH)


    // Get Site Map json if file does exist
    if (fs.existsSync(ABS_SITE_GUIDE_PATH)) {
        const site_guide_content = fs.readFileSync(ABS_SITE_GUIDE_PATH, 'utf8');
        site_guide_json = JSON.parse(site_guide_content);
    }
    else {  // Create Site Map directory if file does not exit
        fs.mkdirSync(abs_site_guide_dir, { recursive: true });
    }


    // Add data
    const site_url = get_mdx_url(process.cwd())
    site_guide_json[site_url] = {
        category: Category,
        title: Title
    }


    // Write to file
    fs.writeFileSync(ABS_SITE_GUIDE_PATH, JSON.stringify(site_guide_json), "utf8")

}
export function HTMLSkeleton({ children, UseGlobalStyle = true, UseCodeStyle = true, Title = SiteName, RegisterToGuide = {} }) {  // The "Boilerplate" html, Useful for cross device compatibility

    // Register into guide if objects are passed
    if (Object.keys(RegisterToGuide).length !== 0)
        guide_register(RegisterToGuide.category, RegisterToGuide.title)


    // Define page title based on props passed
    const page_title = ("title" in RegisterToGuide ? `${RegisterToGuide.title} - ${SiteName}` : SiteName)


    return (<>
        <html lang="en">
            <head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>{page_title}</title>
                {UseCodeStyle && <link rel="stylesheet" href={STATIC_CODE_STYLE_URL} />}
                {UseGlobalStyle && <GlobalStyle />}
            </head>
            <body>
                {children}
            </body>
        </html>
    </>)
}
export function GlobalStyle({ AdditionalStyles = "" }) { // Returns a style tag with global styles

    return (<style>{`
    
        body {
            background-color: Canvas;
            color: CanvasText;
            color-scheme: light dark;
            font-size:18px;
            margin:0 auto;
            max-width:700px;
            line-height:1.3;
            padding: 40px 1rem;
        }
        
    ` + AdditionalStyles}</style>)
}
export function ContentGuide() {  // Reads the guide.json and Creates links to all registed pages

    // Get Site Map
    let site_guide = {}
    if (fs.existsSync(ABS_SITE_GUIDE_PATH)) {
        const site_guide_content = fs.readFileSync(ABS_SITE_GUIDE_PATH, 'utf8');
        site_guide = JSON.parse(site_guide_content);
    }


    // Create content Map
    let content_guide = {} // { <Category>:[ { <title>, <site_url> }, ... ], ... }
    for (const [key, value] of Object.entries(site_guide)) {
        const site_url = key
        const category = value.category
        const title = value.title
        const new_dict = {
            title,
            site_url
        }

        // Add to content guide
        if (category in content_guide)
            content_guide[category].push(new_dict)
        else
            content_guide[category] = [new_dict]
    }


    return (<>{

        Object.entries(content_guide).map(([category, arr]) => (<Fragment key={category}>
            <br /><br />
            <h1 >{category}</h1>
            <ol>{
                arr.map((dict, index) => (<li key={index}>
                    <a target="_blank" href={dict.site_url}>{dict.title}</a>
                </li>))
            }</ol>
        </Fragment>))

    }</>)
}
export function Heading({ children }) {  // Create heading component with linebreak and horizontal rule
    return (<>
        <h1>{children}</h1>

        <hr /><br /><br />
    </>)
}
