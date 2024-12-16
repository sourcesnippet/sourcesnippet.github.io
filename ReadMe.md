# [SourceSnippet](https://sourcesnippet.github.io/)

A website for storing reusable code segements

## How does it work?

All the .mdx files are stored inside `/_mdx` and have corresponding generated .html files which are placed in the root of this repository.

These .html are then statically hosted via [github pages](https://pages.github.com/)

## How to run locally?

1. Install [Deno](https://deno.com/) (**Strictly** Version 2.0 & above )
2. Run `cd _source`  
3. Run `npm i`
4. Inside `/_source` you can run any of the following commands

   ```bash
   npm run create
   npm run server
   ```

   `npm run create` will create .html files for each corresponding .mdx file

   `npm run server` will host the site on [localhost:3000](http://localhost:3000/) and will auto update when mdx files are changed & saved