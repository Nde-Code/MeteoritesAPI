# Developer guide for setting up, configuring, developing, and deploying the project:

Complete developer guide for contributing to this project or creating your own version to run on [Cloudflare Workers](https://workers.cloudflare.com/) using [Wrangler](https://developers.cloudflare.com/workers/wrangler/).

> **Note:** this project does not include a `package.json`, and it does not require any npm dependencies.

## 🚀 Getting started with GitHub Codespaces:

The project provides a pre-configured [Dev Container](https://containers.dev/) environment for [GitHub Codespaces](https://github.com/features/codespaces), making it quick and easy to start coding.

Using Codespaces is the recommended way to work on the project because it automatically sets up the required elements and provides a ready-to-code environment.

### 0. Fork the repository:

First, create a fork of the repository by following: [https://docs.github.com/en/pull-requests/how-tos/work-with-forks/fork-a-repo](https://docs.github.com/en/pull-requests/how-tos/work-with-forks/fork-a-repo).

You will obtain a repository containing your own copy of the project on your GitHub account, which allows you to use the project, make modifications, and share them with me via a pull request if you wish.

### 1. Configure the required secrets:

Before you start a new Codespaces environment and begin coding in it, you need to register the required secrets *(in this project, only one secret is required)* in the repository's GitHub Codespaces secrets.

See the [environment variables](#environment-variables) section for the required configuration and the [GitHub Codespaces documentation about secrets](https://docs.github.com/en/codespaces/managing-your-codespaces/managing-your-account-specific-secrets-for-github-codespaces) for more details.

### 2. Open the repository in GitHub Codespaces:

Open the repository on GitHub and create a new Codespace from the Code → Codespaces menu.

GitHub will automatically detect the project's [`.devcontainer.json`](../.devcontainer.json) configuration and build the development environment.

### 3. Automatic environment setup:

The [`.devcontainer.json`](../.devcontainer.json) file:

```json
{
    "name": "MeteoritesAPI Codespaces setup script",
    "image": "mcr.microsoft.com/devcontainers/base:ubuntu",
    "features": {
        "ghcr.io/devcontainers/features/node:1": {
            "version": "24"
        }
    },
    "postCreateCommand": "npm install -g wrangler && echo \"IP_HASH_SALT=\\\"$IP_HASH_SALT\\\"\" > .dev.vars && wrangler types",
    "remoteUser": "vscode"
}
```

defines the Codespace development environment:

| Component | Configuration |
|---|---|
| **Base image** | Ubuntu-based development container |
| **Node.js** | Version `24` |
| **Cloudflare Wrangler** | Latest version, with `v4` or later required |
| **Environment variables** | Populated from the Codespaces environment and written to `.dev.vars` |
| **TypeScript definitions** | Generated with `wrangler types` |
| **Remote user** | `vscode` |

The `postCreateCommand` automatically performs the required setup when the Codespace is created.

Wrangler is intentionally installed globally inside the Codespace to keep the repository free of Node.js dependencies.

> **Note:** `.dev.vars` is a local development file and must never be committed to the repository. It is already included in [`.gitignore`](../.gitignore).

### 4. Authenticate with Cloudflare:

Once the Codespace has finished initializing, authenticate Wrangler with your Cloudflare account:

```bash
wrangler login
```

## ⚙️ Configuration setup:

Review the [`wrangler.jsonc`](../wrangler.jsonc) file, which contains the complete project configuration:

```jsonc
{
    "name": "project-name",
    "main": "main.ts",
    "compatibility_date": "2026-08-12",
    "preview_urls": false,
    "observability": {
        "enabled": true,
        "head_sampling_rate": 1,
        "logs": {
            "invocation_logs": false
        },
        "traces": {
            "enabled": false
        }
    }
}
```

### Core configuration fields:

#### `name`

Defines the **Worker project name**.
This determines your public URL (e.g., `https://project-name.your-subdomain.workers.dev`).

#### `main`

Specifies the **entry point** of your Worker script.
This file exports your main fetch handler.

#### `compatibility_date`

Locks your Worker to a specific Cloudflare Workers runtime version.
Ensures compatibility even as Cloudflare updates the platform.

#### `preview_urls`

Enables or disables preview URLs for testing.

* `true` = Enables preview URLs
* `false` = Disables preview URLs

> For more details: [https://developers.cloudflare.com/workers/configuration/previews/](https://developers.cloudflare.com/workers/configuration/previews/)

### Observability configuration:

#### `observability.enabled`

When `true`, enables **automatic metrics and logs collection**.
Allows performance and error monitoring in the Cloudflare dashboard.

#### `observability.head_sampling_rate`

Defines the **percentage of requests sampled for tracing** (0 to 1):

* `1` = 100% sampling (useful for debugging)
* `0.1` = 10% sampling (better for production)

#### `observability.logs.invocation_logs`

Controls **automatic invocation log collection**:

* `true` = Logs request metadata, headers, and execution details
* `false` = Disables automatic logs, keeping only custom `console.log` entries

> Disabling invocation logs is **recommended for GDPR compliance** to prevent storage of sensitive request data.

#### `observability.traces.enabled`

Controls **distributed tracing**:

* `true` = Enables tracing spans and trace IDs
* `false` = Disables tracing entirely

> Leave disabled if not using OpenTelemetry or a tracing system.

### Environment variables:

The Worker uses standard environment variables in a `.dev.vars` file for local development and [Cloudflare Workers Secrets for deployed Workers](https://developers.cloudflare.com/workers/configuration/secrets/#secrets-on-deployed-workers) in production.

#### Variable in this project:

| Variable | Description |
|----------|-------------|
| `IP_HASH_SALT` | Cryptographic salt for hashing user IP addresses |

#### Local development:

Create/configure the following value as [GitHub Codespaces secrets](https://docs.github.com/en/codespaces/managing-your-codespaces/managing-your-account-specific-secrets-for-github-codespaces). When the Codespace is created, [`.devcontainer.json`](../.devcontainer.json) automatically writes it to `.dev.vars`:

```env
IP_HASH_SALT="THE_SALT_USED_TO_HASH"
```

#### Production:

For the deployed Worker, configure the same value as [Cloudflare Workers Secrets for deployed Workers](https://developers.cloudflare.com/workers/configuration/secrets/#secrets-on-deployed-workers):

```bash
wrangler secret put IP_HASH_SALT
```

#### Security notes:

| Variable | Requirements |
|---|---|
| `IP_HASH_SALT` | Use a strong value with at least **30 characters**, including uppercase and lowercase letters and numbers |

> `IP_HASH_SALT` is a sensitive secret and must be handled with extreme caution. You may use scripts or tools to generate it, but make sure you never leak, log, or expose it.

### Software configuration:

Take a look at the [`config.ts`](../config.ts) file at the root of the project, which looks like:

```ts
export const config: StaticConfig = {

	RATE_LIMIT_INTERVAL_S: 1, // Min: 1
	
	MAX_RANDOM_METEORITES: 1000, // Min: 100
	
	MAX_RETURNED_SEARCH_RESULTS: 500, // Min: 100
	
	MIN_RADIUS: 1, // Min: 1
	
	MAX_RADIUS: 2500, // Min: 1000
	
	DEFAULT_RANDOM_NUMBER_OF_METEORITES: 100 // Min: 100

};
```

#### Configuration parameters:

| Parameter | Description | Constraint |
|-----------|-------------|-------------|
| `RATE_LIMIT_INTERVAL_S` | Rate limit interval in seconds | Minimum: 1 second |
| `MAX_RANDOM_METEORITES` | Maximum meteorites returned by `/random` | Minimum: 100 meteorites |
| `MAX_RETURNED_SEARCH_RESULTS` | Maximum meteorites returned by `/search` | Minimum: 100 meteorites |
| `MIN_RADIUS` | Minimum allowed search radius (km) | Minimum: 1 km |
| `MAX_RADIUS` | Maximum allowed search radius (km) | Minimum: 1000 km |
| `DEFAULT_RANDOM_NUMBER_OF_METEORITES` | Default count for `/random` if not specified | Minimum: 100 meteorites |

> **Important:** `MAX_RANDOM_METEORITES` must always be greater than `DEFAULT_RANDOM_NUMBER_OF_METEORITES` and violating constraints will trigger a configuration error.

## 💻 Development server:

Once your Codespace is ready and your Cloudflare account is authenticated, you're ready to start coding, but some explanation of TypeScript types and the running process will be provided in this section.

### 1. TypeScript types:

The Dev Container automatically runs `wrangler types` when the Codespace is created, generating the TypeScript definitions required by the Worker in `worker-configuration.d.ts`.

If you change your Wrangler configuration, regenerate the definitions manually with:

```bash
wrangler types
```

> Ensure [`wrangler.jsonc`](../wrangler.jsonc) is properly configured before regenerating the types.

The generated definitions are automatically picked up by TypeScript through the `types` option in [`tsconfig.json`](../tsconfig.json):

```json
{
    "compilerOptions": {
        "noEmit": true,
        "allowImportingTsExtensions": true,
        "target": "ES2020",
        "lib": [
            "ES2020",
            "DOM"
        ],
        "module": "ESNext",
        "moduleResolution": "Bundler",
        "verbatimModuleSyntax": true,
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true,
        "types": [
            "./worker-configuration.d.ts"
        ],
        "resolveJsonModule": true
    },
    "include": [
        "utilities",
        "worker-configuration.d.ts",
        "main.ts",
        "config.ts",
        "types"
    ],
    "exclude": [
        "node_modules",
        "dist"
    ]
}
```

#### TypeScript configuration explanation:

| Setting                                  | Purpose                                                                                     |
| ---------------------------------------- | ------------------------------------------------------------------------------------------- |
| `noEmit: true`                           | Prevents TypeScript from emitting JavaScript locally; Wrangler handles bundling             |
| `allowImportingTsExtensions: true`       | Allows direct `.ts` file imports for relative paths                                         |
| `target: "ES2020"`                       | Uses modern JavaScript syntax supported by the Workers runtime                              |
| `lib: ["ES2020", "DOM"]`                 | Includes modern JavaScript features and Web APIs such as `fetch`, `Request`, and `Response` |
| `module: "ESNext"`                       | Uses the ES Modules standard for Workers                                                    |
| `moduleResolution: "Bundler"`            | Configures module resolution for bundler-based ESM environments                             |
| `verbatimModuleSyntax: true`             | Preserves module syntax as written and requires explicit `import type` for type-only imports |
| `strict: true`                            | Enables strict type-checking for safer code                                                 |
| `esModuleInterop: true`                   | Facilitates interoperability with CommonJS modules                                          |
| `skipLibCheck: true`                      | Skips type checking for `.d.ts` files to speed up compilation                               |
| `forceConsistentCasingInFileNames: true` | Prevents file casing errors across operating systems                                        |
| `types: ["./worker-configuration.d.ts"]` | Loads the TypeScript definitions generated by Wrangler                                      |
| `resolveJsonModule: true`                 | Allows importing JSON files as modules                                                      |
| `include`                                | Specifies the source files and types to type-check                                          |
| `exclude`                                | Specifies build artifacts and dependencies to ignore                                        |

### 2. Run and deploy:

#### Start local development:

```bash
wrangler dev
```

#### Deploy to Cloudflare Workers:

> Make sure your [Cloudflare Workers Secrets (for deployed Workers)](https://developers.cloudflare.com/workers/configuration/secrets/#secrets-on-deployed-workers) have been configured before deploying (see [environment variables](#environment-variables)).

```bash
wrangler deploy
```

If the Worker is configured to use a `workers.dev` subdomain, Wrangler will display the deployed URL.

## 📌 Support:

For issues or questions, open an [issue on GitHub](https://github.com/Nde-Code/MeteoritesAPI/issues).
