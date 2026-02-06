import fs from "fs"
import path from "path"

export function modBundleMDXSettings(settings) {
    var oldBuildOptions = settings.esbuildOptions;
    settings.esbuildOptions = (options) => {
        options = oldBuildOptions(options)
        options.alias = {
            ...options.alias,
            '@': process.cwd(), // Maps '@' to your project root
        };

        return options;
    }

    return settings
}

export function onSiteCreateEnd(inputPath, outputPath, wasInterrupted) {

    // Return if site was interrupted while creating
    if(wasInterrupted){
        return;
    }


    // Create .nojekyll
    fs.writeFileSync(path.join(outputPath, '.nojekyll'), "");
}