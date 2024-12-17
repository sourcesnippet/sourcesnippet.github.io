import React from "npm:react"


// Constants
export const SiteName = "SourceSnippet" // Stores the name of the site


// Functions
export function GlobalStyle({ AdditionalStyles }) { // Returns a style tag with global styles

    return (<style>{`
    
        body {
            background-color: Canvas;
            color: CanvasText;
            color-scheme: light dark;
            font-size:18px;
            margin:0 auto;
            max-width:650px;
            line-height:1.3;
            padding: 40px 1rem;
        }
        
    ` + AdditionalStyles}</style>)
}
export function HTMLSkeleton({ children, Title = SiteName }) {  // The "boilerplate" of html, Useful for cross device compatibility

    return (<>
        <html lang="en">
            <head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>{Title}</title>
            </head>
            <body>
                {children}
            </body>
        </html>
    </>)
}