# ISRO API

An open-source API for public information about ISRO spacecraft, launch vehicles,
customer satellites, centres and spacecraft missions.

## API endpoints

| Endpoint | Description |
| --- | --- |
| `/api/spacecrafts` | ISRO spacecraft and satellites |
| `/api/launchers` | Launch vehicle missions included in the dataset |
| `/api/customer_satellites` | Satellites launched for international customers |
| `/api/centres` | ISRO centres and units |
| `/api/spacecraft_missions` | Information for spacecraft missions |

Production base URL: <https://isro.vercel.app>

For example, request:

```text
https://isro.vercel.app/api/spacecrafts
```

All endpoints return JSON. The APIs are read-only and support standard HTTP GET requests.

## Response shapes

The spacecrafts, launchers, customer satellites and centres endpoints return an
object containing the dataset name as an array:

```json
{
  "spacecrafts": [
    {
      "id": 1,
      "name": "Aryabhata"
    }
  ]
}
```

`/api/spacecraft_missions` is a JSON array of mission objects. Customer satellite
launch dates currently use `DD-MM-YYYY`.

## Local development

Requirements:

- Node.js 18 or newer
- npm

Install dependencies and run the API locally:

```powershell
npm install
npx vercel dev
```

Run the validation suite:

```powershell
npm test
```

## Data sources and updates

The JSON datasets are maintained in [`data/`](./data). Their values are based on
public ISRO material. Each dataset update should preserve existing field names
so API consumers are not broken unexpectedly.

Contributions changing data should include:

1. The official ISRO source or publication.
2. A validation command showing the JSON remains valid.
3. An explanation of records added, removed or corrected.

Recent spacecraft updates are sourced from the official ISRO mission pages:

- [Aditya-L1](https://www.isro.gov.in/Aditya_L1.html)
- [XPoSat](https://www.isro.gov.in/XPoSat.html)
- [Chandrayaan-3](https://www.isro.gov.in/Chandrayaan3.html)
- [NISAR mission update](https://www.isro.gov.in/one_successful_year_of_NISAR.html)
- [GSLV-F17 / EOS-05 mission](https://www.isro.gov.in/Mission_GSLVF17.html)
- [GSLV-F18 / NVS-03 mission](https://www.isro.gov.in/Mission_GSLVF18.html)

The spacecraft and launcher lists are not yet a complete inventory of all
missions since 2023. In particular, historical launch manifests, customer
satellite launches and the list of centres still need source-by-source review.
Do not treat the latest records in these files as evidence that the full catalog
is current.

## Contributing

Please open an issue before large dataset or response-shape changes. Bug fixes,
documentation improvements and data corrections are welcome.
