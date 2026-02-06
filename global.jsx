import fs from "fs"
import path from "path"


/* Properties */
export const SITE_NAME = "SourceSnippet";
export const SITE_MOTTO = "Come. Copy. Go. As simple as that!";
export const REPO_LINK = "https://github.com/sourcesnippet/sourcesnippet.github.io";
export const SEARCHBAR_TOOLTIP = ""
export const SITE_CREATION_TOOL = "https://www.npmjs.com/package/host-mdx"
export const SITE_LOGO_PATH = "/static/Logo.png"


/* Components */
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
        <img id="site-logo" src={SITE_LOGO_PATH} />
        <div id="site-title">{SITE_NAME}</div>
        <div id="site-motto">{SITE_MOTTO}</div>
    </a>)
}

export function SearchBar() {
    return (<div className="search-wrapper">
        <input id="search" type="text" placeholder="Search..." title={SEARCHBAR_TOOLTIP} />
        <button className="search-btn" title={SEARCHBAR_TOOLTIP}>🔍</button>
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

export function SnippetCard({ imgSrc, text, link, tags = [] }) {

    const TagsComponent = tags.map((tag, index) => (<a className="tag" key={index} href="#">{tag}</a>));

    return (<div className="snippet-card">
        <a href={link} className="snippet-card-thumbnail" tabindex="-1">
            <img src={imgSrc} onerror="this.src='/static/Placeholder.png'" alt="thumbnail" />
        </a>
        <a href={link} className="snippet-card-title" title={text}>
            <div>{text}</div>
        </a>
        <div className="snippet-card-tags">{TagsComponent}</div>
    </div>)
}

export function Snippet({ metaData = {}, children }) {

    // Default styles Component
    const stylePath = `/${path.relative(process.cwd(), cwd)}/styles.css`;
    const absStylePath = path.join(process.cwd(), stylePath);
    const stylePathExists = fs.existsSync(absStylePath);
    const defaultStyles = (<>
        <link rel="stylesheet" href="/static/global-styles.css" />
        {stylePathExists && <link rel="stylesheet" href={stylePath} />}
    </>);


    // Tags Component
    const TagsComponent = metaData?.tags?.map((tag, index) => {
        return (<a className="tag" key={index} href="#">{tag}</a>)
    });


    return (<HTMLSkeleton title={`${metaData?.title} | ${SITE_NAME}`} extendHead={[metaData?.extendHead, defaultStyles]}>

        <Header />
        <SearchBar />
        <hr />
        <NavBar />
        <hr style="margin-bottom: 2rem" />

        <div id="snippet-header">
            {metaData?.thumbnail && metaData?.thumbnail !== "" && <img id="snippet-thumbnail" src={metaData?.thumbnail} onerror="this.src='/static/Placeholder.png'" alt="thumbnail" />}
            <div id="snippet-card-title-wrapper">
                <h1 id="snippet-card-title">{metaData?.title ?? "Untitled"}</h1>
                <a id="snippet-author" className={metaData?.authorWebsite && "snippet-no-author"} href={metaData?.authorWebsite}>By {metaData?.author ?? "Unkown"}</a>
                {metaData?.createdOnDate !== null && <div id="snippet-creation-date">Posted On: {formatDate(metaData?.createdOnDate)}</div>}
                {metaData?.editedOnDate !== null && <div id="snippet-update-date">Updated On: {formatDate(metaData?.editedOnDate)}</div>}
            </div>
        </div>

        <article id="snippet-content">
            {children}
        </article>

        <div className="tag-container">{TagsComponent}</div>

        <hr style="margin-top: 2rem" />
        <Footer showWarning={true} />

    </HTMLSkeleton>)
}

export function PaginationBar({ }) {
    return (<nav id="pagination">
        <a href="#" className="pagination-prev"></a>
        <a href="#" className="pagination-item">1</a>
        <span className="pagination-dots">...</span>
        <a href="#" className="pagination-item" >4</a>
        <a href="#" className="pagination-item" >5</a>
        <a href="#" className="pagination-item pagination-active" >6</a>
        <a href="#" className="pagination-item" >7</a>
        <a href="#" className="pagination-item" >8</a>
        <span className="pagination-dots">...</span>
        <a href="#" className="pagination-item" >1000</a>
        <a href="#" className="pagination-next"></a>
    </nav>)
}

export function Footer({ showWarning = false }) {
    return (<footer>
        <a id="footer-logo-wrapper" href="/"><img id="footer-logo" src={SITE_LOGO_PATH} /></a>
        <div id="footer-links" style={showWarning ? "margin-bottom: 3rem" : ""}>
            <a href={REPO_LINK} target="_blank">Repository</a>
            <hr />
            <a href={`${REPO_LINK}/issues`} target="_blank">Report Bug</a>
            <hr />
            <a href="/contact">Contact</a>
        </div>
        {showWarning && <div id="footer-warning">Scraping data for AI training or any other purpose is strictly prohibited. <a href="/terms#ai-data-scraping-policy">Learn More</a></div>}
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