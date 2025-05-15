import { Plugin } from 'vite';
import { Config } from './config';


// Replaces app.css with the contents of the file specified in the
// config file.
export const themePlugin = (): Plugin => {
    const themeFile = Config.THEME;
    console.log(`Using theme file: ${themeFile}`);
    return {
        name: 'theme-generator',
        enforce: 'pre', // Ensure this plugin runs first
        transform(code, id) {
            if (id.endsWith('app.css')) {
                const colorsCode = Deno.readTextFileSync(Deno.cwd() + '/src/themes/colors.css');
                // Read the theme file and replace the contents of app.css with it
                // Needs full path to the file
                const themeCode = Deno.readTextFileSync(Deno.cwd() + '/src/themes/' + themeFile);
                // Replace the contents of app.css with the theme code

                // and add a comment at the top
                const themeComment = `/* Generated from ${themeFile} */\n`;
                const themeCodeWithComment = themeComment + colorsCode + themeCode;
                // Return the theme code as the new contents of app.css
                return {
                    code: themeCodeWithComment,
                    map: null,
                };
            }
            return null;
        }
    };
};