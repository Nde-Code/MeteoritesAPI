# Meteorites Landings API:

A RESTful API built with **TypeScript** and **Wrangler** to query and analyze the NASA Meteorites Landings dataset.

You can found the original dataset here and by: [NASA Open Data Portal](https://data.nasa.gov/dataset/meteorite-landings)

You can deploy your own instance of this API using the button below:

> I host the project on the free plan, so it works well with medium and small datasets (see [data/](data/)).
> However, the complete dataset may require a paid plan, especially if you intend to use the API at scale.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Nde-Code/MeteoritesAPI)

## 🚀 Features:   

- CORS: You're free to use the API in your website or any other project.

- No sign-up, no credit card, or other personal information required.

- No logs are maintained to track user activity (logs are only for debugging and performance).

- Basic rate limiting implemented to prevent API abuse.

- GDPR compliant: IP addresses are hashed using `SHA-256` with a strong, secure key.

- Accurate search: You can apply multiple filters to tailor the request as precisely as needed.

- This is a lightweight, highly optimized project for serverless environments that handles extensive computation.

## 🌐 API Endpoints:

The API is available here:

| Link: | Rate limit: | Owner: | Privacy Notice: | Dataset |
| :--- | :--- | :-- | :--- | :--- |
| [https://meteorites.nde-code.workers.dev/](https://meteorites.nde-code.workers.dev/) | 1 req/s | [Nde-Code](https://nde-code.github.io/) | [privacy.md](docs/privacy.md) | 8.5K of [entries](../meteorites-v2/data/meteorites_small.json) |

And here is an overview of how [my config.ts](config.ts) is currently configured for endpoints limitations:

| Code: | Value: | Description: | Note: |
| :--- | :---: | :--- | :-- |
| `MAX_RANDOM_METEORITES` | 1000 | Maximum number of random meteorites. | If the requested `count` parameter exceeds this limit, an error will be returned. |
| `MAX_RETURNED_SEARCH_RESULTS` | 500 | Maximum number of search results. | The search process will stop if the results exceed this limit. |
| `MIN_RADIUS` | 1 | Minimum allowed radius. | If the `radius` parameter is below the minimum, an error will be returned. |
| `MAX_RADIUS` | 2500 | Maximum allowed radius. | If the `radius` parameter exceeds the maximum, an error will be returned. |
| `DEFAULT_RANDOM_NUMBER_OF_METEORITES` | 100 | Default number of random meteorites. | Default number returned when the `count` parameter is missing. |

### 1. **[GET]** `/search`:

Search meteorites using various filters, including name, class, date, mass, and geographic location.

#### **Query Parameters:**

| Parameter     | Type   | Description                                                                |
| ------------- | ------ | -------------------------------------------------------------------------- |
| `recclass`    | string | Meteorite classification                                |
| `fall`        | string | Fall status (`Fell` or `Found`)                                            |
| `year`        | number | Exact year the meteorite fell or was found                                 |
| `minYear`     | number | Minimum year for filtering                                                 |
| `maxYear`     | number | Maximum year for filtering                                                 |
| `mass`        | number | Exact mass in grams                                                        |
| `minMass`     | number | Minimum mass in grams                                                      |
| `maxMass`     | number | Maximum mass in grams                                                      |
| `centerLatitude`  | number | Latitude of the center point for location filtering **(required with radius)** |
| `centerLongitude` | number | Longitude of the center point **(required with radius)**                       |
| `radius`      | number | Radius in kilometers for location filtering (min: `MIN_RADIUS`, max: `MAX_RADIUS`) **(required with center coords)**  |
| `limit`      | number | Maximum number of search results (min: 1, max: `MAX_RETURNED_SEARCH_RESULTS`)  |

> **Note:** Unrecognized parameters are ignored. The `limit` parameter is automatically capped if it exceeds `MAX_RETURNED_SEARCH_RESULTS`. However, any malformed parameters (e.g., text instead of a number), out-of-range coordinates, or conflicting filters (e.g., combining `year` with `minYear`) will trigger a `400 Bad Request` error.

> **Note on geographic radius precision:** The `/search` endpoint uses an equirectangular approximation for distance calculation (optimized for performance). It is highly accurate for local and regional queries (<= 1000–1500 km). For larger radii, especially at high latitudes, small distortions may occur compared to true geodesic (Haversine) distance calculations.

#### **Response:**

* `200 OK`: Successful query with results.

* `400 Bad Request`: Missing or invalid parameters.

* `404 Not Found`: No meteorite data available.

* `429 Too Many Requests`: Rate limit exceeded.

* `403 Forbidden`: Unable to hash your IP.

* `500 Internal Server Error`: Wrong environment variable, config or server error.

* `503 Service Unavailable`: Cache is empty or loading.

#### **Example Request:**

```bash
curl "https://meteorites.nde-code.workers.dev/search?minYear=1998&centerLatitude=45.0&centerLongitude=5.0&radius=200"
```

#### **Example Response:**

```json
{
  "success": {
    "count": 1,
    "meteorites": [
      {
        "id": "458",
        "name": "Alby sur Chéran",
        "recclass": "Eucrite-mmict",
        "mass": 252,
        "fall": "Fell",
        "year": 2002,
        "latitude": 45.82133,
        "longitude": 6.01533
      }
    ]
  }
}
```

### 2. **[GET]** `/get`:

Retrieve detailed information about a single meteorite by either its unique `id` or its exact `name`.

#### **Query Parameters:**

| Parameter | Type   | Description                                  |
| --------- | ------ | --------------------------------------------|
| `id`      | string | Unique identifier of the meteorite          |
| `name`    | string | Exact name of the meteorite (case-insensitive, normalized) |

> **Note:** You must provide **either** `id` **or** `name`. Supplying **both** parameters will result in an error. If **neither** is provided, the request will be rejected.

#### **Response:**

* `200 OK`: Meteorite found and returned.  

* `400 Bad Request`: Both parameters are missing or invalid.  

* `404 Not Found`: No meteorite matches the given identifier.  

* `429 Too Many Requests`: Rate limit exceeded.

* `403 Forbidden`: Unable to hash your IP.

* `500 Internal Server Error`: Wrong environment variable, config or server error.

* `503 Service Unavailable`: Cache is empty or loading.

#### **Example Requests:**

Get meteorite by `id`:

```bash
curl "https://meteorites.nde-code.workers.dev/get?id=12345"
````

Get meteorite by `name`:

```bash
curl "https://meteorites.nde-code.workers.dev/get?name=Kopjes%20Vlei"
```

#### **Example Response:**

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

### 3. **[GET]** `/random`:

Get a random selection of meteorites.

Returns a randomly selected subset of meteorites, limited by a configurable maximum.

#### **Query Parameters:**

| Parameter | Type   | Description                                                                                                                                    |
| --------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `count`   | number | Number of random meteorites to return. Defaults to `DEFAULT_RANDOM_NUMBER_OF_METEORITES`. Cannot exceed `MAX_RANDOM_METEORITES`. |

#### **Response:**

* `200 OK`: Successfully returns a random list of meteorites.

* `400 Bad Request`: Invalid `count` parameter.

* `404 Not Found`: No meteorites data available.

* `429 Too Many Requests`: Rate limit exceeded.

* `403 Forbidden`: Unable to hash your IP.

* `500 Internal Server Error`: Wrong environment variable, config or server error.

* `503 Service Unavailable`: Cache is empty or loading.

#### **Example Request:**

```bash
curl "https://meteorites.nde-code.workers.dev/random?count=3"
```

#### **Example Response:**

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

### 4. **[GET]** `/stats`:

Retrieve aggregated statistics about the meteorite dataset stored.

Returns useful insights such as year ranges, mass stats, classification counts, and geolocation information.

#### **Fields Explained:**

| Field                      | Type      | Description                                             |
| -------------------------- | --------- | ------------------------------------------------------- |
| `meteorites_count`         | number    | Total number of meteorites                              |
| `min_year`, `max_year`     | string    | Earliest and latest year of meteorite fall/found        |
| `min_mass_g`, `max_mass_g` | number    | Smallest and largest mass in grams                      |
| `avg_mass_g`               | number    | Average mass in grams (rounded to 2 decimal places)     |
| `years`                    | string[] | Sorted list of all available years in the dataset       |
| `years_distribution`       | object | Frequency of each classification based on `year`       |
| `recclasses`               | string[] | Sorted list of unique meteorite classifications         |
| `recclasses_distribution`  | object    | Frequency of each classification based on `recclass`   |
| `geolocated_count`         | number    | Number of meteorites with valid latitude and longitude  |
| `fall_counts`              | object    | Breakdown of meteorites by fall type: `fell` vs `found` |

> **Note:** Some meteorites are recorded with a mass of **0 grams**. This is not an error, but rather a reflection of specific characteristics such as extreme alteration, fossilization, or missing recoverable fragments. It's important to recognize that these cases do occur. 

#### **Response:**

* `200 OK`: Statistics successfully returned.

* `404 Not Found`: No meteorite data available.

* `429 Too Many Requests`: Rate limit exceeded.

* `403 Forbidden`: Unable to hash your IP.

* `500 Internal Server Error`: Wrong environment variable, config or server error.

* `503 Service Unavailable`: Cache is empty or loading.

#### **Example Request:**

```bash
curl "https://meteorites.nde-code.workers.dev/stats"
```

#### **Returned JSON Structure:**

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

## 🖥️ Documentation for developers:

The project is a [Cloudflare Workers](https://workers.cloudflare.com/) application that uses the Cloudflare runtime called [Workerd](https://github.com/cloudflare/workerd). The setup and code are not very different from a Node.js or Deno project, but there are a few things to keep in mind. So, for that, I provide documentation [here](docs/docs.md).

As explained above, this API works on data, and I designed something highly optimized. However, with limited resources, I had to make choices and reduce the dataset a little bit. Here are the different databases you can use if you deploy the project on your own instance:

- The entire database (33K entries): [meteorites_complete.json](data/meteorites_complete.json)

- The medium dataset (15K entries, reduced by *grid filtering*): [meteorites_medium.json](data/meteorites_medium.json)
> Compiled via: `python compiler.py --input data/meteorites.csv --output data/meteorites_medium.json --grid 0.00085 --limit 15000 --clean-up`

- The small dataset **(used)** (8.5K entries, reduced by *grid filtering*): [meteorites_small.json](data/meteorites_small.json)
> Compiled via: `python compiler.py --input data/meteorites.csv --output data/meteorites_small.json --grid 0.014 --limit 8500 --clean-up`

> The small dataset is probably the best choice because the complete meteorites dataset contains a lot of noise. It depends on what you want to do with the project, but for statistics/visualization, the small dataset is likely the most suitable option.

### Compile your own dataset using the Python CLI:

If you need to create your own dataset, you can use the Python CLI (requires **Python 3.10+**, **no external dependencies**) with the following arguments:

| Argument        | Description |
|-----------------|-------------|
| `--input`       | Path to the input [meteorites.csv](data/meteorites.csv) file **(required)** |
| `--output`      | Path to the output JSON file **(required)** |
| `--grid`        | Grid cell size in degrees (optional, > 0 enables grid filtering) |
| `--limit`       | Maximum number of records (optional, `0` = unlimited) |
| `--clean-up` **(Recommended)**    | Removes meteorite records with missing, invalid, or placeholder location data (e.g. `reclat`/`reclong` equal to `0.0` or `GeoLocation` set to `(0.0, 0.0)`), and normalizes empty metadata fields to ensure cleaner and more consistent output. |
| `--debug`       | Debug level: `0` (silent), `1` (info), `2` (verbose) |

Navigate to the directory containing `compiler.py` and run the following command:
```bash
python compiler.py --input data/meteorites.csv --output data/my_db.json --clean-up --debug 2
```

You can also get help directly in your terminal via:
```bash
python compiler.py --help
```

> ⚠️ When the `--grid` option is enabled, the script applies a grid-based spatial filter for visualization only. It limits each grid cell to a maximum of one meteorite to reduce point density in highly concentrated areas (e.g., Antarctic fields like Yamato) and improve map readability. No scientific attributes are modified: latitude, longitude, year, mass, and classification remain **exactly** as in the original NASA CSV. Only some records are removed to reduce visual clutter. When used with `--grid`, the script produces datasets (like: [meteorites_medium.json](data/meteorites_medium.json) and [meteorites_small.json](data/meteorites_small.json)) that do not preserve the original spatial or statistical distribution and must not be used for scientific or analytical purposes.

## ⚖️ License:

This project is licensed under the [Apache License v2.0](LICENSE).

## 🎯 Reach me:

Created and maintained by [Nde-Code](https://nde-code.github.io/).

> Feel free to reach out for questions or collaboration, or open an issue or pull request and I'll be happy to help.
