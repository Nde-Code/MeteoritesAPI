# The developer documentation:

Here is the complete developer guide for anyone who wants to contribute or create their own version of this project and make it work on [Cloudflare Workers](https://workers.cloudflare.com/) using [Wrangler](https://developers.cloudflare.com/workers/wrangler/).

## 🚀 To begin:

### 1. Create or login to your cloudflare account: [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)

### 2. Install Node.js and npm: [https://nodejs.org/en/download](https://nodejs.org/en/download)

### 3. Install the Wrangler CLI using:

```bash
npm install -g wrangler
```

> If you haven't installed Wrangler globally, prefix commands with `npx`, for example `npx wrangler`. 

### 4. Clone the project branch:

```bash
git clone https://github.com/Nde-Code/MeteoritesAPI.git
```

### 5. Log your Wrangler CLI to your Cloudflare account using:

```bash
wrangler login
```

## ⚙️ Setting up the configuration:

First, take a look at the [wrangler.jsonc](../wrangler.jsonc) file, which contains the full configuration for your project:

```jsonc
{
	"name": "meteorites",
	"main": "main.ts",
	"compatibility_date": "2025-10-08",
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

### Main elements:

#### `name`

Defines the **name of your Worker project**.
This determines the public URL for your Worker on Cloudflare (for example:
`https://project_name.username.workers.dev`).

#### `main`

Specifies the **entry point** of your Worker script.
This is the file that exports your main fetch handler.

#### `compatibility_date`

Locks your Worker to a specific version of the Cloudflare Workers runtime.
This ensures your code continues to work as expected, even if Cloudflare updates the runtime.

#### `preview_urls`

It’s used to create a previewable URL. That’s a feature in Cloudflare Workers, but it’s not really useful for a small project. Feel free to take a look at: [https://developers.cloudflare.com/workers/configuration/previews/](https://developers.cloudflare.com/workers/configuration/previews/)

### Observability:

#### `observability.enabled`

When set to `true`, enables **automatic metrics and logs collection** for your Worker.
This lets you monitor performance and errors in the Cloudflare dashboard.

#### `observability.head_sampling_rate`

Defines the **percentage of requests sampled for tracing** (from `0` to `1`).

* `1` = 100% of requests are sampled (useful for debugging).
* `0.1` = 10% of requests are traced (better for production environments).

#### `observability.logs.invocation_logs`

Controls whether **automatic invocation logs** are collected for each Worker execution.

* `true` (default) = Cloudflare logs metadata like request method, URL, headers, and execution details.
* `false` = Disables automatic logs, keeping only your custom `console.log` entries.

> Disabling invocation logs is recommended for **GDPR compliance**, as it prevents Cloudflare from storing potentially sensitive request data.

#### `observability.tracing.enabled`

Controls whether **distributed tracing** is enabled for your Worker.

* `true` = Enables tracing spans and trace IDs for each request (requires compatible tracing backend).
* `false` = Disables tracing entirely.

> Tracing is disabled by default. If you're not using OpenTelemetry or a tracing system, leave this off to reduce data collection.

### Environment Variables:

To start working **locally** with environment variables, create a file called `.dev.vars` and add the following content:

```env
HASH_KEY="THE_KEY_USED_TO_HASH_IPS"
```

**List of variables in this project:**

| Variable   | Description                                                                 |
| ---------- | --------------------------------------------------------------------------- |
| `HASH_KEY` | The cryptographic key used to hash user IPs.       |

When you have finished, **make sure there are no traces of secrets** in your code, and run the following command.  
*(Normally, you'll only need to do this once, when you first create the project.)*

```bash
wrangler secret put HASH_KEY
```

> Check out [https://developers.cloudflare.com/workers/configuration/secrets/](https://developers.cloudflare.com/workers/configuration/secrets/) if you need further information.

### Software configuration file [config.ts](../config.ts):

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

- **`RATE_LIMIT_INTERVAL_S`** *(in second)*: This is the rate limit based on requests.
  - **Currently**:
    - **Max**: one request per second (absolute min).

- **`MAX_RANDOM_METEORITES`**: The maximum number of meteorites retrieved from `/random`.
  - **Absolute min of max**: 100 meteorites.
 
- **`MAX_RETURNED_SEARCH_RESULTS`**: The maximum number of meteorites retrieved from `/search` when the result set is large.
  - **Absolute min of max**: 100 meteorites.

- **`MIN_RADIUS`** & **`MAX_RADIUS`**: The minimum and maximum radius values allowed by the API to define the circular search area.
  - **Absolute min of `MIN_RADIUS`**: 1 (Currently)
  - **Absolute min of `MAX_RADIUS`**: 1000

- **`DEFAULT_RANDOM_NUMBER_OF_METEORITES`**: In `/random`, if no `count` parameter is provided, this is the default number of meteorites retrieved.
  - **Absolute min**: 100 meteorites.

**NB:** `MAX_RANDOM_METEORITES` must be greater than `DEFAULT_RANDOM_NUMBER_OF_METEORITES`.

> Ensure these values and rules are respected; otherwise, your configuration will trigger an error message.

## 💻 Start the development server:

### First, initialize TypeScript types:

To benefit from TypeScript definitions in your editor and avoid compilation errors, you can add the Cloudflare Workers type definitions by running:

```bash
wrangler types
```

> Be sure that your `wrangler.jsonc` is correctly configured before running this command.

and put in `tsconfig.json`: 

> already done, if you've cloned the project so you don't need to do that.

```json
{
  "compilerOptions": {
    "noEmit": true,
    "allowImportingTsExtensions": true,
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "module": "ESNext",
    "moduleResolution": "Node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "types": ["./worker-configuration.d.ts"],
    "resolveJsonModule": true
  },
  "include": ["utilities", "worker-configuration.d.ts", "main.ts", "config.ts", "types"],
  "exclude": ["node_modules", "dist"]
}
```

Here's a brief summary of what the `tsconfig.json` file do:

* **`noEmit: true`**
  Prevents TypeScript from emitting compiled JS files locally. The build and bundling is handled by **Wrangler/esbuild**, so this is only for type checking.

* **`allowImportingTsExtensions: true`**
  Allows importing `.ts` files directly, which is required for relative imports.

* **`target: "ES2020"`**
  Uses modern JavaScript syntax supported by the Worker runtime.

* **`lib: ["ES2020", "DOM"]`**
  Includes modern JS features (`ES2020`) and standard Web APIs (`DOM`) like `fetch`, `Request`, and `Response`.

* **`module: "ESNext"`**
  Uses ES Modules, which is the standard for Workers and modern TypeScript projects.

* **`moduleResolution: "Node"`**
  Tells TypeScript/IDE how to resolve modules.

  * Not strictly needed for relative `.ts` imports (they work anyway).
  * Useful if you later add npm packages: TypeScript and VS Code will correctly locate modules.
  * Does **not affect the final bundle**; esbuild handles module resolution.

* **`strict: true`**
  Enables all strict type checking options for safer, more predictable code.

* **`esModuleInterop: true`**
  Facilitates interoperability with CommonJS modules if needed.

* **`skipLibCheck: true`**
  Skips type checking for `.d.ts` files in dependencies to speed up compilation.

* **`forceConsistentCasingInFileNames: true`**
  Prevents file casing errors across different operating systems.

* **`types: ["./worker-configuration.d.ts"]`**
  Includes type definitions for Wrangler bindings (KV, R2, Durable Objects, etc.).

* **`resolveJsonModule: true`**
  Because data are imported into memory using an `import`.

* **`include`**
  Files/folders that TypeScript will type check: project source code and types.

* **`exclude`**
  Ignored folders: build artifacts (`dist`), dependencies (`node_modules`).

This project doesn't rely on any external libraries or dependencies, so there's no `package.json` or npm-related files.

### Run the project and deploy it once it's ready:

To run locally, run:

```bash
wrangler dev
```

To bundle the project before deploying, run:

```bash
wrangler build
```

And in the end, to deploy in the Workers network, run:

```bash
wrangler deploy
```

and your project is now deployed and accessible to anyone with the link.

## 📌 At the end:

If you need any assistance, feel free to open an issue at [https://github.com/Nde-Code/MeteoritesAPI/issues](https://github.com/Nde-Code/MeteoritesAPI/issues).
