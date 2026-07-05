# Meteorites Landings API:

A RESTful API built with **TypeScript** and **Wrangler CLI** to query and analyze the NASA Meteorite Landings dataset.

The original dataset is available from the [NASA Open Data Portal](https://data.nasa.gov/dataset/meteorite-landings).

The API is hosted on a free plan, optimized for medium and small datasets (see [`data/`](data/)). The complete dataset may require a paid plan, especially for large-scale usage.

You can deploy your own instance by clicking the button below:

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Nde-Code/MeteoritesAPI)

> **Service status:** check the [status page](https://nde-status.instatus.com/) if you experience latency or issues.

## 🚀 Key features:

- **CORS enabled:** use the API directly from your website or any other project.

- **No sign-up required:** no account creation, credit card, or personal data needed.

- **Privacy-focused:** no user activity logs (logs only for debugging).

- **Rate limiting:** protection against abuse with request throttling.

- **GDPR compliant:** IP addresses hashed with SHA-256 using a secure key.

- **Advanced search:** multiple filters for precise queries.

- **Serverless optimized:** lightweight, high-performance architecture.

## 🌐 API access:

| Endpoint | Rate limit | Maintainer | Privacy | Dataset |
|----------|-----------|-----------|---------|---------|
| [https://meteorites.nde-code.workers.dev/](https://meteorites.nde-code.workers.dev/) | 1 req/s | [Me](https://nde-code.github.io/) | [`privacy.md`](docs/privacy.md) | [`meteorites_small.json`](data/meteorites_small.json) |

### Configuration limits:

Here are the parameters in [`config.ts`](config.ts):

```yaml
# Absolute upper limit; exceeding this value triggers an error:
MAX_RANDOM_METEORITES: 1000      

# Maximum number of results the search system will return: 
MAX_RETURNED_SEARCH_RESULTS: 500 

# Smallest allowed radius for any computation or query:
MIN_RADIUS: 1   

# Largest allowed radius to prevent overly broad or costly searches:
MAX_RADIUS: 2500    

# Default number used when no 'count' value is provided:
DEFAULT_RANDOM_METEORITES: 100
```

> **Note:** these limits may be updated, so check the repository regularly to stay informed.

## 📚 Available endpoints:

### 1. **[GET]** `/search` - Advanced search:

Search meteorites by multiple criteria: name, classification, date, mass, and geographic location.

#### Query parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `recclass` | string | Meteorite classification |
| `fall` | string | Fall status: `Fell` or `Found` |
| `year` | number | Exact year of fall or discovery |
| `minYear` | number | Minimum year |
| `maxYear` | number | Maximum year |
| `mass` | number | Exact mass (grams) |
| `minMass` | number | Minimum mass (grams) |
| `maxMass` | number | Maximum mass (grams) |
| `centerLatitude` | number | Center latitude **(required with radius)** |
| `centerLongitude` | number | Center longitude **(required with radius)** |
| `radius` | number | Search radius in km (min: `MIN_RADIUS`, max: `MAX_RADIUS`) **(required with coordinates)** |
| `limit` | number | Maximum results (min: 1, max: `MAX_RETURNED_SEARCH_RESULTS`) |

⚠️ **Geographic precision:** distance calculation uses equirectangular approximation (optimized for performance). Highly accurate for local/regional queries (< 1000–1500 km). For larger radii, especially at high latitudes, minor distortions may occur compared to geodesic (Haversine) calculations.

#### Parameter behavior:

- **Unknown parameters:** are ignored.

- **Invalid numeric parameters:** are treated as absent (e.g., `year=abc`).

- **Conflicting filters:** return `400` error (e.g., `year` with `minYear`/`maxYear`).

- **Geographic search:** requires all three: `centerLatitude`, `centerLongitude`, and `radius`.

- **`limit`:** is automatically capped at `MAX_RETURNED_SEARCH_RESULTS`.

#### Response codes:

| Code | Description |
|------|-------------|
| `200` | Success (may return empty set) |
| `400` | Missing or invalid parameters |
| `429` | Rate limit exceeded |
| `500` | Server error (config or environment) |
| `503` | Service unavailable (cache empty/loading) |

#### Example request:

```bash
curl "https://meteorites.nde-code.workers.dev/search?year=2013"
```

#### Example response:

```json
{
    "success": {
        "count": 1,
        "meteorites": [
            {
                "id": "57165",
                "name": "Chelyabinsk",
                "recclass": "LL5",
                "mass": 100000,
                "fall": "Fell",
                "year": 2013,
                "latitude": 54.81667,
                "longitude": 61.11667
            }
        ]
    }
}
```

### 2. **[GET]** `/get` - Meteorite details:

Retrieve detailed information about a single meteorite by `id` or `name`.

#### Query parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Unique meteorite identifier |
| `name` | string | Exact meteorite name (case-insensitive, normalized) |

> **Important:** provide **either** `id` **or** `name`, but not both. Providing neither will result in a `400` error.

#### Response codes:

| Code | Description |
|------|-------------|
| `200` | Meteorite found |
| `400` | Missing/invalid parameters or both provided |
| `404` | No matching meteorite |
| `429` | Rate limit exceeded |
| `500` | Server error |
| `503` | Service unavailable |

#### Example requests:

By ID:

```bash
curl "https://meteorites.nde-code.workers.dev/get?id=12345"
```

By name:

```bash
curl "https://meteorites.nde-code.workers.dev/get?name=Kopjes%20Vlei"
```

#### Example response:

```json
{
    "success": {
        "meteorite": {
            "id": "12345",
            "name": "Kopjes Vlei",
            "recclass": "Iron, IIAB",
            "mass": 13600,
            "fall": "Found",
            "year": 1914,
            "latitude": -29.3,
            "longitude": 21.15
        }
    }
}
```

### 3. **[GET]** `/random` - Random selection:

Get a random set of meteorites.

#### Query parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `count` | number | Number of meteorites (default: `DEFAULT_RANDOM_METEORITES`, max: `MAX_RANDOM_METEORITES`) |

> **Note:** invalid `count` returns the default number.

#### Response codes:

| Code | Description |
|------|-------------|
| `200` | Success |
| `400` | Invalid `count` parameter |
| `429` | Rate limit exceeded |
| `500` | Server error |
| `503` | Service unavailable |

#### Example request:

```bash
curl "https://meteorites.nde-code.workers.dev/random?count=3"
```

#### Example response:

```json
{
    "success": {
        "count": 3,
        "meteorites": [
            {
                "id": "14764",
                "name": "Mabwe-Khoywa",
                "recclass": "L5",
                "mass": 540,
                "fall": "Fell",
                "year": 1937,
                "latitude": 19,
                "longitude": 97
            },
            {
                "id": "11442",
                "name": "Guibga",
                "recclass": "L5",
                "mass": 288,
                "fall": "Fell",
                "year": 1972,
                "latitude": 13.5,
                "longitude": -0.68333
            },
            {
                "id": "8671",
                "name": "Elephant Moraine 90262",
                "recclass": "L6",
                "mass": 9.2,
                "fall": "Found",
                "year": 1990,
                "latitude": -76.28752,
                "longitude": 156.44737
            }
        ]
    }
}
```

### 4. **[GET]** `/stats` - Dataset statistics:

Get aggregated statistics: year ranges, mass stats, classifications, and geolocation info.

#### Response fields:

| Field | Type | Description |
|-------|------|-------------|
| `meteorites_count` | number | Total number of meteorites |
| `min_year`, `max_year` | string | Earliest and latest year |
| `min_mass_g`, `max_mass_g` | number | Minimum/maximum mass (grams) |
| `avg_mass_g` | number | Average mass (2 decimal places) |
| `years` | string[] | Sorted list of all available years |
| `years_distribution` | object | Frequency by year |
| `recclasses` | string[] | List of unique classifications |
| `recclasses_distribution` | object | Frequency by classification |
| `geolocated_count` | number | Meteorites with valid coordinates |
| `fall_counts` | object | Breakdown of `fell` vs `found` |

> **Note:** some meteorites have a mass of **0 grams**. This reflects specific cases (extreme alteration, fossilization, missing fragments) and is not an error.

#### Response codes:

| Code | Description |
|------|-------------|
| `200` | Success |
| `429` | Rate limit exceeded |
| `500` | Server error |
| `503` | Service unavailable |

#### Example request:

```bash
curl "https://meteorites.nde-code.workers.dev/stats"
```

#### Example response:

```js
{
    "success": {
        "meteorites_count": 8500,
        "min_year": "860",
        "max_year": "2013",
        "min_mass_g": 0.1,
        "max_mass_g": 60000000,
        "avg_mass_g": 68231.78,
        "years": [
            "860",
            "920",
            "1399",
            "1490",
            "1491",
            ...
        ],
        "years_distribution": {
            "860": 1,
            "920": 1,
            "1399": 1,
            "1490": 1,
            "1491": 1,
            ...
        }
        "recclasses": [
            "Acapulcoite",
            "Achondrite-ung",
            "Angrite",
            "Aubrite",
            ...
        ],
        "recclasses_distribution": {
            "L6": 1616,
            "H5": 1461,
            "H6": 749,
            "L5": 653,
            "H4": 637,
            ...
        },
        "geolocated_count": 8500,
        "fall_counts": {
            "fell": 1095,
            "found": 7405
        }
    }
}
```

### 5. **[GET]** `/health` - Service status:

Check API integrity and status, including cache and indexes.

#### Response fields:

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Overall status: `"healthy"` or `"unhealthy"` |
| `timestamp` | string | ISO 8601 timestamp of check |
| `checks` | object | Details of internal components |
| `message` | string | Status summary message |

#### Internal checks detail:

| Check | Description |
|----------|-----------------|
| `cache_ready` | Main cache fully loaded |
| `meteorites_count` | Total meteorites in memory |
| `shuffled_meteorites_count` | Meteorites available for `/random` |
| `stats_available` | Pre-computed statistics ready |
| `by_id_index_size` | Entries in ID lookup index |
| `by_name_index_size` | Entries in name lookup index |

> **Service Health:** a `503` response indicates at least one check failed (cache not ready, empty indexes, etc.).

#### Response codes:

| Code | Description |
|------|-------------|
| `200` | All systems operational |
| `503` | One or more checks failed |

#### Example request:

```bash
curl "https://meteorites.nde-code.workers.dev/health"
```

#### Example response (Healthy):

```json
{
    "status": "healthy",
    "timestamp": "2026-04-23T12:14:49.107Z",
    "checks": {
        "cache_ready": true,
        "meteorites_count": 8500,
        "shuffled_meteorites_count": 8500,
        "stats_available": true,
        "by_id_index_size": 8500,
        "by_name_index_size": 8500
    },
    "message": "All endpoints are functional."
}
```

## 🖥️ Developer documentation:

This project is a [Cloudflare Workers](https://workers.cloudflare.com/) application using the [Workerd](https://github.com/cloudflare/workerd) runtime. The structure is similar to Node.js or Deno with a few specifics. See the [full documentation](docs/docs.md) for details.

### Available datasets:

The API is optimized for performance with limited resources. Choose datasets based on your needs:

| Dataset | Size | Description |
|---------|------|-------------|
| [`meteorites_complete.json`](data/meteorites_complete.json) | ~33k entries | Complete dataset (unfiltered) |
| [`meteorites_medium.json`](data/meteorites_medium.json) | ~15k entries | Reduced via grid filtering |
| [`meteorites_small.json`](data/meteorites_small.json) | ~8.5k entries | **Default**, reduced via grid filtering |

> All these datasets have been cleaned up (see below for further details).

**Medium dataset** generated via:

```bash
python compiler.py --input data/meteorites.csv --output data/meteorites_medium.json \
  --grid 0.00085 --limit 15000 --clean-up --minify
```

**Small dataset** generated via:

```bash
python compiler.py --input data/meteorites.csv --output data/meteorites_small.json \
  --grid 0.014 --limit 8500 --clean-up --minify
```

## >_ Python CLI for custom datasets:

Requires **Python 3.10+** (no external dependencies).

### Available options:

| Argument | Description |
|----------|-------------|
| `--input` | Path to [`meteorites.csv`](data/meteorites.csv) **(required)** |
| `--output` | Path to output JSON file **(required)** |
| `--grid` | Grid cell size in degrees (optional, > 0 enables filtering) |
| `--limit` | Max records (optional, `0` = unlimited). Processing stops once limit reached |
| `--clean-up` | Remove records with missing/invalid location data and normalize empty fields **(recommended)** |
| `--minify` | Minify output JSON by removing unnecessary whitespace |
| `--debug` | Verbosity level: `0` (silent), `1` (info), `2` (verbose) |

### Usage:

Navigate to the directory containing [`compiler.py`](compiler.py) and run:

```bash
python compiler.py --input data/meteorites.csv --output data/my_db.json --clean-up --debug 2
```

For help:
```bash
python compiler.py --help
```

> **Note:** the `--grid` option creates visually optimized datasets (one meteorite per cell) but loses original statistical distribution. These datasets **must not be used for scientific research**.

## ⚖️ License:

This project is licensed under the **[Apache License v2.0](LICENSE)**.

## 🎯 Author:

Created and maintained by [Nde-Code](https://nde-code.github.io/).

> Don't hesitate to open an issue or a pull request if you have any questions or would like to contribute.
