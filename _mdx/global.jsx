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
function create_local_guide(children) {  // Create a list of links towards Heading Components with "id"

    // Make sure children is of type object
    if (typeof children !== "object") {
        return []
    }


    // Make sure children is inside an array
    if (!Array.isArray(children)) {
        children = Array.of(children)
    }


    // Get guide index & headings
    let heading_urls = {}
    let local_guide_index = -1
    for (let i = 0; i < children.length; i++) {

        let child = children[i]
        let inner_content = child.props.children

        // Get the Heading id & URL 
        if (child.props.id !== undefined)
            heading_urls[`#${child.props?.id}`] = inner_content

        // Save the index of local guide
        else if (child.type == LocalGuide)
            local_guide_index = i + 1

    }


    // If local guide component found 
    let modified_children = children
    if (local_guide_index !== -1) {

        // Create Guide Component
        let guide_component = (<ol key={0}>{
            Object.keys(heading_urls).map((value, index) => (
                <li key={index} style={{ marginTop: "0.5rem" }}>
                    <a href={value}>{heading_urls[value]}</a>
                </li>
            ))
        }</ol>)

        // Insert guide_component at local guide index
        modified_children = children.toSpliced(local_guide_index, 0, guide_component)

    }

    return modified_children

}


// Components
export function HTMLSkeleton({   // The "Boilerplate" html, Useful for cross device compatibility
    children,
    UseGlobalStyle = true,  // Adds the GlobalStyle Component
    UseCodeStyle = true,  // Adds the CodeStyle Component
    RegisterToSiteGuide = {},  // Register provided dictionary to site guide 
    UseLocalGuide = false  // Creates a local guide at the last LocalGuide component found
}) {

    // Register into guide if objects are passed
    if (Object.keys(RegisterToSiteGuide).length !== 0) {
        guide_register(RegisterToSiteGuide.category, RegisterToSiteGuide.title)
    }


    // Define page title based on props passed
    const page_title = ("title" in RegisterToSiteGuide ? `${RegisterToSiteGuide.title} - ${SiteName}` : SiteName)


    // Create index at Index component
    if (UseLocalGuide) {
        children = create_local_guide(children)
    }

    return (<>
        <html lang="en">
            <head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>{page_title}</title>
                {UseCodeStyle && <CodeStyle />}
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
export function CodeStyle() { // Returns a style tag with global styles
    return (<link rel="stylesheet" href={STATIC_CODE_STYLE_URL} />)
}
export function SiteGuide() {  // Reads the guide.json and Creates links to all registed pages

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
            <br />
            <h1 >{category}</h1>
            <ol>{
                arr.map((dict, index) => (<li key={index} style={{ marginTop: "1rem" }}>
                    <a target="_blank" href={dict.site_url}>{dict.title}</a>
                </li>))
            }</ol>
        </Fragment>))

    }</>)
}
export function LocalGuide({ children, HeadingFunc = H2 }) {  // Component which points to where the local guide should be created
    return <HeadingFunc>{children}</HeadingFunc>
}
export function Heading({ children, UseHR = false, TopBRCount = 0, BottomBRCount = 0 }) {  // Create heading component with linebreak and horizontal rule

    const TopMultiLineBreak = Array.from({ length: TopBRCount }, (_, index) => <br key={index}></br>)
    const BottomMultiLineBreak = Array.from({ length: BottomBRCount }, (_, index) => <br key={index}></br>)

    return (<>

        {TopMultiLineBreak}

        {children}

        {UseHR && <hr />}

        {BottomMultiLineBreak}
    </>)
}
export function H1(props) {  // Heading Tags 1-6, Pass them an "id" to make them appear on local guide, Note: keep one line empty line around these otherwise they won't show up on local guide
    let default_props = {}

    // Default implementations
    if (props.UseHR === undefined)
        default_props.UseHR = true

    if (props.BottomBRCount === undefined)
        default_props.BottomBRCount = 1


    return <Heading {...props} {...default_props}><h1 id={props.id}>{props.children}</h1></Heading>
}
export function H2(props) {
    return <Heading {...props}><h2 id={props.id}>{props.children}</h2></Heading>
}
export function H3(props) {
    return <Heading {...props}><h3 id={props.id}>{props.children}</h3></Heading>
}
export function H4(props) {
    return <Heading {...props}><h4 id={props.id}>{props.children}</h4></Heading>
}
export function H5(props) {
    return <Heading {...props}><h5 id={props.id}>{props.children}</h5></Heading>
}
export function H6(props) {
    return <Heading {...props}><h6 id={props.id}>{props.children}</h6></Heading>
}