import { Plugin } from 'vite';
import { Config } from './config';


// Replaces app.css with the contents of the file specified in the
// config file.
export const themePlugin = (): Plugin => {
    const themeFolder = Config.THEME;
    console.log(`Using theme folder: ${themeFolder}`);
    return {
        name: 'theme-generator',
        enforce: 'pre', // Ensure this plugin runs first
        transform(code, id) {
            if (id.endsWith('app.css')) {
                const colorsCode = Deno.readTextFileSync(Deno.cwd() + '/themes/colors.css');
                // Read the theme file and replace the contents of app.css with it
                // Needs full path to the file
                const themeCode = Deno.readTextFileSync(Deno.cwd() + '/themes/' + themeFolder + '/theme.css');
                // Replace the contents of app.css with the theme code

                // and add a comment at the top
                const themeComment = `/* Generated from ${themeFolder} */\n`;
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