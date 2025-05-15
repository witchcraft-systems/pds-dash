# pds-dash

a frontend dashboard with stats for your ATProto PDS.

## setup

### prerequisites

- [deno](https://deno.com/manual/getting_started/installation)

### installing

clone the repo, copy `config.ts.example` to `config.ts` and edit it to your liking.

then, install dependencies using deno:

```sh
deno install
```

### development server

local develompent server with hot reloading:

```sh
deno task dev
```

### building

to build the optimized bundle run:

```sh
deno task build
```

the output will be in the `dist/` directory.

## deploying

we use our own CI/CD workflow at [`.forgejo/workflows/deploy.yaml`](.forgejo/workflows/deploy.yaml), but it boils down to building the project bundle and deploying it to a web server. it'll probably make more sense to host it on the same domain as your PDS, but it doesn't affect anything if you host it somewhere else.

## configuring

[`config.ts`](config.ts) is the main configuration file, you can find more information in the file itself.

## theming

the colors are designated in [`src/app.css`](src/app.css) as variables, go crazy with them

the rest is done by editing the css files and style tags directly, good luck

relevant files:

- [`src/App.svelte`](src/App.svelte)
- [`src/app.css`](src/app.css)
- [`src/lib/AccountComponent.svelte`](src/lib/AccountComponent.svelte)
- [`src/lib/PostComponent.svelte`](src/lib/PostComponent.svelte)

the favicon is located at [`public/favicon.ico`](public/favicon.ico)

## license

MIT
