
// :root {
//     --link-color: #646cff;
//     --link-hover-color: #535bf2;
//     --background-color: #12082b; hsl(257, 69%, 10%)
//     --header-background-color: #1f1145; hsl(257, 60%, 15%)
//     --content-background-color: #0d0620; hsl(257, 68%, 7%)
//     --text-color: white;
//     --border-color: #8054f0; hsl(257, 84%, 64%)
//     --indicator-inactive-color: #4a4a4a;
//     --indicator-active-color: #8054f0;
//   }
export const CssVarsFromHue = (hue: number) => {
    const h = hue % 360;
    const cssVars = {
        accent: `hsl(${h}, 85%, 65%)`,
        background: `hsl(${h}, 69%, 10%)`,
        header: `hsl(${h}, 60%, 15%)`,
        content: `hsl(${h}, 68%, 7%)`,
        text: `hsl(${h}, 0%, 100%)`,
        link: `hsl(${h}, 100%, 50%)`,
        linkHover: `hsl(${h}, 100%, 40%)`,
    };
    return cssVars;
};

