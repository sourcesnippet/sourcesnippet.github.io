import fs from "fs"
import path from "path"
import { TAGS_QUERY } from "@/static/global-script.js";


// Properties
export const SITE_NAME = "SourceSnippet";
export const SITE_MOTTO = "Come. Copy. Go. As simple as that!";
export const REPO_LINK = "https://github.com/sourcesnippet/sourcesnippet.github.io";
export const SITE_CREATION_TOOL = "https://www.npmjs.com/package/host-mdx"
export const SITE_LOGO_PATH = "/static/logo.png"
export const PLACEHOLDER_IMG_PATH = "/static/placeholder.png"
export const DEFAULT_SNIPPET_STYLES_PATH = "styles.css"
export const DEFAULT_SNIPPET_SCRIPT_PATH = "script.js"


// Internal Properties
const languageClassPrefix = "hljs language-"
const displayNameProp = "display-name"


// Components
export function HTMLSkeleton({ title = "", description = "", children, extendHead = <></> }) {    // The "Boilerplate" html, Useful for cross device compatibility
    return (<>
        <html lang="en">
            <head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>{title}</title>
                <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico?" />
                <meta name="description" content={description}></meta>
                {extendHead}
            </head>
            <body>
                {children}
            </body>
        </html>
    </>)
}

export function Header() {
    return (<a id="site-header" href="/">
        <img id="site-logo" alt="logo" src={SITE_LOGO_PATH} />
        <div id="site-title">{SITE_NAME}</div>
        <div id="site-motto">{SITE_MOTTO}</div>
    </a>)
}

export function SearchBar({ id = "searchbar" }) {
    return (<div id={id} className="search-wrapper">
        <input className="search-input" type="text" placeholder="Search..." />
        <div className="search-dropdown">
            <a href="#" className="search-more" style={"display:none"}>Show all results</a>
            <a href="#" className="search-nonefound" style={"display:none"}>No results found</a>
        </div>
        <button className="search-btn"></button>
    </div>)
}

export function NavBar() {
    return (<nav id="navbar">
        <a href="/snippets">All</a>
        <a href="/tags">Tags</a>
        <a href="/about">About</a>
        <a href="/terms">Terms</a>
    </nav>)
}

export function Tags({ tags }) {

    // Return empty fragment if no tags
    if (!tags || tags?.length == 0) {
        return (<></>)
    }

    return tags?.map((tag, index) => (<a className="tag" key={index} href={`/?${TAGS_QUERY}=${encodeURIComponent(tag)}`}>{tag}</a>));
}

export function SnippetCard({ className = "", imgSrc, text, link, tags = [] }) {

    return (<div className={`snippet-card ${className}`}>
        <a href={link} className="snippet-card-thumbnail" tabindex="-1">
            <img src={imgSrc ?? PLACEHOLDER_IMG_PATH} onerror={`this.src='${PLACEHOLDER_IMG_PATH}'`} alt="thumbnail" />
        </a>
        <a href={link} className="snippet-card-title" title={text}>
            <div>{text}</div>
        </a>
        <div className="snippet-card-tags">
            <Tags tags={tags} />
        </div>
    </div>)
}

export function Snippet({ metaData = {}, children }) {

    // Default styles Component
    const stylePathExists = fs.existsSync(path.join(hostmdxCwd, DEFAULT_SNIPPET_STYLES_PATH));
    const scriptPathExists = fs.existsSync(path.join(hostmdxCwd, DEFAULT_SNIPPET_SCRIPT_PATH));
    const defaultHead = (<>
        <link rel="preload" href="/static/copy-done-icon.png" as="image" />
        <link rel="stylesheet" href="/static/global-styles.css" />
        <link rel="stylesheet" href="/static/code-styles.css" />
        {stylePathExists && <link rel="stylesheet" href={DEFAULT_SNIPPET_STYLES_PATH} />}
        {scriptPathExists && <script type="module" src={DEFAULT_SNIPPET_SCRIPT_PATH}></script>}
        <script src="/static/snippets.js"></script>
    </>);


    return (<HTMLSkeleton title={`${metaData?.title} | ${SITE_NAME}`} extendHead={[defaultHead, metaData?.extendHead]}>

        <Header />
        <SearchBar />
        <hr />
        <NavBar />
        <hr style="margin-bottom: 2rem" />

        <div id="snippet-header">
            {metaData?.thumbnail && metaData?.thumbnail !== "" && <img id="snippet-thumbnail" src={metaData?.thumbnail} onerror={`this.src='${PLACEHOLDER_IMG_PATH}'`} alt="thumbnail" />}
            <div id="snippet-card-title-wrapper">
                <h1 id="snippet-card-title">{metaData?.title ?? "Untitled"}</h1>
                {metaData?.author && <a id="snippet-author" className={!metaData?.authorWebsite && "snippet-no-author"} href={metaData?.authorWebsite ? metaData?.authorWebsite : undefined}>By {metaData.author}</a>}
                {metaData?.createdOnDate && <div id="snippet-creation-date">Posted On: {formatDate(metaData?.createdOnDate)}</div>}
                {metaData?.editedOnDate && <div id="snippet-update-date">Updated On: {formatDate(metaData?.editedOnDate)}</div>}
            </div>
        </div>

        <article id="snippet-content">
            {children}
        </article>

        <div className="tag-container">
            <Tags tags={metaData?.tags} />
        </div>

        <hr style="margin-top: 2rem" />
        <Footer showWarning={true} />

    </HTMLSkeleton>)
}

export function CodeTabs({ activeIndex = 0, dropdown = false, id = undefined, style = {}, children }) {

    // Make sure children are in array format
    if (!Array.isArray(children)) {
        children = [children]
    }


    // Reset active index if it exceeds language count
    if (children.length <= activeIndex) {
        activeIndex = 0;
    }


    // Get Languages & set default active code block
    let languages = []
    for (let i = 0; i < children.length; i++) {
        // Skip if not <pre>
        let child = children[i];
        if (child?.type !== "pre") {
            continue;
        }


        // Skip if no subchildren
        let subchildren = child?.props?.children;
        if (!subchildren) {
            return;
        }


        // Make sure subchildren are array
        if (!Array.isArray(subchildren)) {
            subchildren = [subchildren]
        }


        // Skip if not <code>
        let firstSubchild = subchildren?.[0]
        if (firstSubchild?.type !== "code") {
            continue;
        }


        // Set as active if it matches index
        if (i === activeIndex) {
            children[i] = Preact.cloneElement(child, {
                className: `${child.props.className || ""} codetabs-active`.trim()
            });
        }


        // Skip if no className or displayName props
        if (!(firstSubchild?.props?.className instanceof String) && (firstSubchild?.props?.[displayNameProp] instanceof String)) {
            continue;
        }


        // Get language from displayName
        if (firstSubchild?.props?.[displayNameProp]) {
            languages.push(firstSubchild?.props?.[displayNameProp]);
            continue;
        }


        // Fallback by getting language from className
        let language = firstSubchild?.props?.className?.replace(languageClassPrefix, "");
        if (language) {
            languages.push(language);
        }
    }


    // Assign topbar either button or dropdown
    let topbarContent = (<></>)
    if (dropdown) {
        topbarContent = (<select name="codetabs-select" onchange="changeTab(this, this.value)">
            {languages.map((lang, index) => (
                <option key={index} value={index} selected={index === activeIndex}>
                    {lang}
                </option>
            ))}
        </select>)
    }
    else {
        topbarContent = (<>{
            languages.map((lang, index) => (
                <button key={lang} className={index === activeIndex ? "codetabs-selected" : undefined} onclick={`changeTabByButton(this, ${index})`}>
                    {lang}
                </button>
            ))
        }</>)
    }


    return (<div className="codetabs" id={id} style={style}>
        <div className="codetabs-topbar">{topbarContent}</div>
        <button className="codetabs-copy" onclick="copyCode(this)"></button>
        <div className="codetabs-content">
            {children}
        </div>
    </div>)
}

export function PaginationBar({ id = "pagination", style }) {
    return (<nav id={id} style={style}>
        <button className="pagination-prev" aria-label="prev"></button>
        <button className="pagination-item"></button>
        <span className="pagination-dots">...</span>
        <button className="pagination-item" ></button>
        <button className="pagination-item" ></button>
        <button className="pagination-item pagination-active" ></button>
        <button className="pagination-item" ></button>
        <button className="pagination-item" ></button>
        <span className="pagination-dots">...</span>
        <button className="pagination-item" ></button>
        <button className="pagination-next" aria-label="next"></button>
    </nav>)
}

export function Footer({ showWarning = false }) {
    return (<footer>
        <a id="footer-logo-wrapper" href="/"><img id="footer-logo" alt="logo" src={SITE_LOGO_PATH} /></a>
        <div id="footer-links" style={showWarning ? "margin-bottom: 2rem" : ""}>
            <a href={REPO_LINK} target="_blank">Repository</a>
            <hr />
            <a href={`${REPO_LINK}/issues`} target="_blank">Report Bug</a>
            <hr />
            <a href="/contact">Contact</a>
        </div>
        {showWarning && <div id="footer-warning">Scraping data for AI training or any other purpose is strictly prohibited. <a href="/terms#ai-data-scraping-policy" aria-label="Learn more about scraping policy">Learn More</a></div>}
    </footer>)
}


// Utility Methods
function formatDate(dateInput) {
    if (dateInput === undefined || dateInput === null) {
        return "-";
    }


    if (dateInput instanceof Date) {
        if (isNaN(dateInput.getTime())) {
            return "-";
        }

        const formatter = new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        return formatter.format(dateInput);
    }


    return dateInput;
}