# NASA Meteorites Landings API:

A RESTful API built with **TypeScript** and **Wrangler** to query and analyze the NASA Meteorites Landings dataset.

Normally, this dataset is provided as a CSV file with over 40,000 entries. I’ve compiled and cleaned it into a JSON format, retaining only the data required for a simple visualization/statistical application (~8.5k of entries). The project runs well even on the free Workers plan, with generous limits (10ms CPU, 128MB memory, ...).

You can deploy your own instance of this API using the button below:

> I host the project on the free plan, so it works well with medium and small datasets (see data/). However, the complete dataset may require a paid plan, especially if you intend to use the API at scale.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Nde-Code/nsh&branch=cf-workers)

You can found the original dataset here and by: [NASA Open Data Portal](https://data.nasa.gov/dataset/meteorite-landings)

## 🚀 Features:   

- CORS: You're free to use the API in your website or any other project.

- No sign-up, no credit card, or other personal information required.

- No logs are maintained to track user activity (logs are only for debugging and performance).

- Basic rate limiting implemented to prevent API abuse.

- GDPR compliant: IP addresses are hashed using `SHA-256` with a strong, secure key.

- Accurate search: You can apply multiple filters to tailor the request as precisely as needed.

## 📚 API Endpoints:

The API is available in:

- URL: [https://meteorites.nde-code.workers.dev/](https://meteorites.nde-code.workers.dev/)
- Rate limit: 1 request per second.
- Privacy policy: [privacy.md](docs/privacy.md)

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
| `radius`      | number | Radius in kilometers for location filtering **(required with center coords)**  |
| `limit`      | number | Maximum number of search results (min: 1, max: `MAX_RETURNED_SEARCH_RESULTS`)  |

> Invalid, non-required parameters will be completely ignored.

#### **Response:**

* `200 OK`: Successful query with results

* `400 Bad Request`: Missing or invalid parameters

* `404 Not Found`: No meteorite data available

* `429 Too Many Requests`: Rate limit exceeded

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

* `200 OK`: Meteorite found and returned  

* `400 Bad Request`: Both parameters are missing or invalid  

* `404 Not Found`: No meteorite matches the given identifier  

* `429 Too Many Requests`: Rate limit exceeded (per second or daily)

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
| `count`   | number | Number of random meteorites to return. Defaults to `config.DEFAULT_RANDOM_NUMBER_OF_METEORITES`. Cannot exceed `config.MAX_RANDOM_METEORITES`. |

> Invalid `count` parameters will be ignored, and the default value will be applied.

#### **Response:**

* `200 OK`: Successfully returns a random list of meteorites.

* `400 Bad Request`: The `count` parameter exceeds the maximum allowed number of meteorites. 

* `404 Not Found`: No meteorites data available.

* `429 Too Many Requests`: Rate limit exceeded.

If the requested `count` exceeds the maximum allowed, the result will be limited and a note will be included in the response.

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
        "id": "6493",
        "name": "Dar al Gani 953",
        "recclass": "H4",
        "mass": 50.5,
        "fall": "Found",
        "year": 1999,
        "latitude": 27.125,
        "longitude": 16.34533
      },
      {
        "id": "44707",
        "name": "Cordes",
        "recclass": "H4",
        "mass": 54.5,
        "fall": "Found",
        "year": 1998,
        "latitude": 34.30333,
        "longitude": -112.16617
      },
      {
        "id": "7457",
        "name": "Dhofar 701",
        "recclass": "L5",
        "mass": 220,
        "fall": "Found",
        "year": 2002,
        "latitude": 19.14833,
        "longitude": 54.80333
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

> **Note:** Some meteorites are recorded with a mass of **0 grams**. This is not an error, but rather a reflection of specific characteristics—such as extreme alteration, fossilization, or missing recoverable fragments. It's important to recognize that these cases do occur. 

#### **Response:**

* `200 OK`: Statistics successfully returned

* `404 Not Found`: No meteorite data available

* `429 Too Many Requests`: Rate limit exceeded

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
    "min_mass_g": 0.03,
    "max_mass_g": 60000000,
    "avg_mass_g": 60692.95,
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
      "Acapulcoite/Lodranite",
      "Achondrite-ung",
      "Angrite",
      "Aubrite",
      ...
    ],
    "recclasses_distribution": {
      "L6": 1743,
      "H5": 1488,
      "H6": 822,
      "L5": 609,
      "H4": 587,
      ...
    },
    "geolocated_count": 8500,
    "fall_counts": {
      "fell": 1094,
      "found": 7406
    }
  }
}
```

## 📦 Documentation for developers:

The project is a [Cloudflare Workers](https://workers.cloudflare.com/) application that uses the Cloudflare runtime called [Workerd](https://github.com/cloudflare/workerd). The setup and code are not very different from a Node.js or Deno project, but there are a few things to keep in mind.

So, for that, I provide documentation here: [https://github.com/Nde-Code/meteorites-v2/docs/docs.md](docs/docs.md)

## 📄 License:

This project is licensed under the [Apache License v2.0](LICENSE).

## 📞 Contact:

Created and maintained by [Nde-Code](https://nde-code.github.io/).

> Feel free to reach out for questions or collaboration, or open an issue or pull request and I'll be happy to help.