# SourceSnippet

A website for documenting code segements

## How to run locally?

1. Download Node.js (STRICTLY above Version 20)
2. Run `npm i`
3. You can run any of the following commands

    ```bash
    node server.js
    node server.js --server
    node server.js -s
    ```

    If you use the `--server` or `-s` flag a server at `localhost:3000` will start and when making and saving any changes to a file inside `/mdx` folder the corresponding html file will be generated inside `/site`

    On pressing `r` Key in the cli while the server is running will rebuild the entire site

    Store any images or similar static assets inside the `/static` folder