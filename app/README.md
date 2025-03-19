# Bun App Repo

The best parts of Nx and Bun combined. Put apps here - this framework is designed for Bun-only JSX driven apps, but you can use
Express, Svelte, or any other framework you want.

## Getting Started
To get started, run `npx nosh init:app [app_name]`. This will create a new app in the apps directory.

If you want to use a template, use nosh init:app:[template_name]
[app_name]. This will use the template you specify.

## Adding Libraries
Apps are the 'servable' part of the monorepo. When using nosh to generate apps, it will store app info in a root level nosh.yml file,
to allow for tooling to be built around the app.

## Component Libraries
You can add component libraries to the libs directory. These are libraries that are not servable, but are used by the apps. You can
add a library as a dependency by adding the following dependency to your `package.json` file:

```json
{
  "dependencies": {
    "<library_name>": "file:libs/<library_name>"
  }
}
```

### Creating a Launch Script
The entrypoint for your app should be either a filename relative to the app directory, or a script in the package.json file. Then, you can use nosh serve [app_name] to serve the app.

### Adding a Template
Eventually, we'll detect patterns that the nosh tooling can modify for a given app/library. When this happens, the libs/nosh/ directory will have an area for templates that can modify apps.

## Patterns

There are three general app patterns that Bun lends itself to:

- **Thin Frontend + Express/Bun Backend**: This is the most common pattern. The @nosh/freebooter enables a more customizable api set, which includes optional helper methods, safeguards, and authentication middleware patterns.

- **Full Stack Bun** - Often, we use separate frameworks - one for react apps/elements (such as NextJS) and one for APIs (express). Freebooter supports both patterns in the same app; it functionally replaces the filesystem-based routing pattern in NextJS with three routing patterns:

1. Static - files in a public folder; this defaults to app/MYAPP/public.
2. Pages - the nextjs page pattern; this is configured in staging.
3. Named - the api pattern where filesystem and routes are not 1:1.

You can see this configured in the etc/app.json for the sample app.
```json
  "routes": {
    "prefix": null,
    "static": {
      "paths": ["public"],
      "options": { "maxAge": 0 }
    },
    "named": { "paths": ["src/api"] },
    "views": "src/scenes"
  }
```

- **Templated Apps** - Apps that are generated from templates. This is the most common pattern for new apps. Once we have defined a set of patterns for UX, nosh templates can also be published.

## Running the app
From the nosh repo root, run `./launch.sh MYAPP` to run the app in folder MYAPP.
The launch script currently has personal as the default app, so running `./launch.sh` will run the personal app.