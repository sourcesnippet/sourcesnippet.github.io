
/* Properties */
export const SITE_NAME = "SourceSnippet";
export const SITE_MOTTO = "Come. Copy. Go. As simple as that!";
export const REPO_LINK = "https://github.com/sourcesnippet/sourcesnippet.github.io";
export const SEARCHBAR_TOOLTIP = ""
export const SITE_CREATION_TOOL = "https://www.npmjs.com/package/host-mdx"


/* Methods */
export function HTMLSkeleton({ title = "", description = "", children, extendHead = <></> }) {    // The "Boilerplate" html, Useful for cross device compatibility
    return (<>
        <html lang="en">
            <head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>{title}</title>
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
        <img id="site-logo" src="static/Logo.png" />
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
        <a href="/all">All</a>
        <a href="/tags">Tags</a>
        <a href="/about">About</a>
        <a href="/terms">Terms</a>
    </nav>)
}

export function SnippetCard({ imgSrc, text, link, tags = [] }) {
    return (<div className="snippet-card">
        <a href={link} className="snippet-img-wrapper" tabindex="-1"><img className="snippet-img" src={imgSrc} /></a>
        <a href={link} className="snippet-title" target="_blank" title={text}>
            <div>{text}</div>
        </a>
        <div className="tag-container">{
            tags.map((tag, index) => (<a className="tag" key={index} href="#">
                {tag}
            </a>))
        }</div>
    </div>)
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
        <img id="footer-logo" src="/static/Logo.png" />
        <div id="footer-links" style={showWarning ? "margin-bottom: 3rem" : ""}>
            <a href={REPO_LINK} target="_blank">Repository</a>
            <hr />
            <a href={`${REPO_LINK}/issues`} target="_blank">Report Bug</a>
            <hr />
            <a href="/contact">Contact</a>
        </div>
        {showWarning && <div id="footer-warning">Scraping data for AI training or any other purpose is strictly prohibited. <a href="#">Learn More</a></div>}
    </footer>)
}