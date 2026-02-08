import fs from "fs"
import path from "path"
import remarkHeadingId from 'remark-heading-id';
import rehypeMdxCodeProps from 'rehype-mdx-code-props'

export function modBundleMDXSettings(inputPath, outputPath, settings) {

    // Build options
    var oldBuildOptions = settings.esbuildOptions;
    settings.esbuildOptions = (options) => {
        options = oldBuildOptions(options)
        options.alias = {
            ...options.alias,
            '@': inputPath, // Maps '@' to your project root
        };

        return options;
    }


    // mdx options
    var oldMdxOptions = settings.mdxOptions;
    settings.mdxOptions = (options) => {
        options = oldMdxOptions(options);
        options.remarkPlugins = [
            ...(options.remarkPlugins ?? []),
            [remarkHeadingId, { defaults: true }],
        ];
        options.rehypePlugins = [
            ...(options.rehypePlugins ?? []),
            [rehypeMdxCodeProps, { tagName: 'code' }]
        ]

        return options
    }


    return settings
}

export function onSiteCreateEnd(inputPath, outputPath, wasInterrupted) {

    // Return if site was interrupted while creating
    if (wasInterrupted) {
        return;
    }


    // Create .nojekyll
    fs.writeFileSync(path.join(outputPath, '.nojekyll'), "");
}

export function toTriggerRecreate(event, path) {
    const isGOutputStream = /\.goutputstream-\w+$/.test(path);
    if (isGOutputStream) {
        return false;
    }

    return true;
}

