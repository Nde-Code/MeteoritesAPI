# Developer documentation:

Complete developer guide for contributing to this project or creating your own version to run on [Cloudflare Workers](https://workers.cloudflare.com/) using [Wrangler](https://developers.cloudflare.com/workers/wrangler/).

## 🚀 Getting started:

### 1. Create or log-in to Cloudflare:

Visit [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up) to create an account or log in.

### 2. Install Node.js and NPM:

Download from [https://nodejs.org/en/download](https://nodejs.org/en/download).

### 3. Install Wrangler CLI:

```bash
npm install -g wrangler
```

> If Wrangler is not installed globally, prefix commands with `npx` (e.g., `npx wrangler`).

### 4. Clone the repository:

```bash
git clone https://github.com/Nde-Code/MeteoritesAPI.git
```

### 5. Authenticate with Cloudflare:

```bash
wrangler login
```

## ⚙️ Configuration setup:

Review the [`wrangler.jsonc`](../wrangler.jsonc) file, which contains the complete project configuration:

```jsonc
{
	"name": "meteorites",
	"main": "main.ts",
	"compatibility_date": "2026-03-08",
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
This determines your public URL (e.g., `https://project_name.username.workers.dev`).

#### `main`

Specifies the **entry point** of your Worker script.
This file exports your main fetch handler.

#### `compatibility_date`

Locks your Worker to a specific Cloudflare Workers runtime version.
Ensures compatibility even as Cloudflare updates the platform.

#### `preview_urls`

Enables preview URLs for testing. Learn more: [https://developers.cloudflare.com/workers/configuration/previews/](https://developers.cloudflare.com/workers/configuration/previews/)

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

Create a `.dev.vars` file for local development:

```env
HASH_KEY="THE_KEY_USED_TO_HASH_IPS"
```

#### Variables in this project:

| Variable | Description |
|----------|-------------|
| `HASH_KEY` | Cryptographic key for hashing user IP addresses |

Once configured, add the secret to your Worker:

```bash
wrangler secret put HASH_KEY
```

> For more details: [https://developers.cloudflare.com/workers/configuration/secrets/](https://developers.cloudflare.com/workers/configuration/secrets/)

### Software configuration: [`config.ts`](../config.ts)

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

| Parameter | Description | Constraints |
|-----------|-------------|-------------|
| `RATE_LIMIT_INTERVAL_S` | Rate limit interval in seconds | Minimum: 1 second |
| `MAX_RANDOM_METEORITES` | Maximum meteorites returned by `/random` | Minimum max: 100 |
| `MAX_RETURNED_SEARCH_RESULTS` | Maximum meteorites returned by `/search` | Minimum max: 100 |
| `MIN_RADIUS` | Minimum allowed search radius (km) | Minimum: 1 |
| `MAX_RADIUS` | Maximum allowed search radius (km) | Minimum: 1000 |
| `DEFAULT_RANDOM_NUMBER_OF_METEORITES` | Default count for `/random` if not specified | Minimum: 100 |

> **Important:** `MAX_RANDOM_METEORITES` must always be greater than `DEFAULT_RANDOM_NUMBER_OF_METEORITES`. If this condition is not met, the configuration will produce errors.

## 🖧 Development server:

### Initialize TypeScript types:

To enable TypeScript definitions in your editor and prevent compilation errors:

```bash
wrangler types
```

> Ensure `wrangler.jsonc` is properly configured before running this command.

This generates type definitions that should be included in [`tsconfig.json`](../tsconfig.json):

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

### TypeScript configuration explanation:

| Setting | Purpose |
|---------|---------|
| `noEmit: true` | Prevents TypeScript from emitting JS locally; Wrangler handles bundling |
| `allowImportingTsExtensions: true` | Allows direct `.ts` file imports for relative paths |
| `target: "ES2020"` | Uses modern JavaScript syntax supported by Workers runtime |
| `lib: ["ES2020", "DOM"]` | Includes modern JS features and Web APIs (fetch, Request, Response) |
| `module: "ESNext"` | Uses ES Modules standard for Workers |
| `moduleResolution: "Bundler"` | Configures module resolution for bundler-based ESM environments |
| `strict: true` | Enables all strict type checking for safer code |
| `esModuleInterop: true` | Facilitates CommonJS interoperability |
| `skipLibCheck: true` | Skips type checking for `.d.ts` files to speed up compilation |
| `forceConsistentCasingInFileNames: true` | Prevents file casing errors across operating systems |
| `types: ["./worker-configuration.d.ts"]` | Includes Wrangler binding type definitions |
| `resolveJsonModule: true` | Enables importing JSON data into memory |
| `include` | Source files and types to type check |
| `exclude` | Build artifacts and dependencies to ignore |

> This project has **no external dependencies**, no `package.json` or npm packages required.

### Run and deploy:

**Start local development:**

```bash
wrangler dev
```

**Bundle for production:**

```bash
wrangler build
```

**Deploy to Cloudflare Workers:**

```bash
wrangler deploy
```

Your project is now live and accessible via the provided URL.

## 📌 Support:

For issues or questions, open an issue on GitHub: [https://github.com/Nde-Code/MeteoritesAPI/issues](https://github.com/Nde-Code/MeteoritesAPI/issues)
