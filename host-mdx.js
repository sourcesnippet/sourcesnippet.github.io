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