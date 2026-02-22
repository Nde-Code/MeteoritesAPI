#!/usr/bin/env python3
import csv
import json
import argparse
import random
import sys
from pathlib import Path

EXPECTED_FIELDS = [
    "name",
    "id",
    "nametype",
    "recclass",
    "mass (g)",
    "fall",
    "year",
    "reclat",
    "reclong",
    "GeoLocation",
]

def debug_print(level: int, current: int, message: str):
    if current >= level:
        print(message)

def is_invalid_location(lat: float | None, lon: float | None, geolocation: str | None) -> bool:

    if lat is None or lon is None:
        return True

    if lat == 0.0 and lon == 0.0:
        return True

    if geolocation:
        geo = geolocation.strip().replace('"', "")
        if geo == "(0.0, 0.0)":
            return True

    return False

def normalize_if_empty(value: str | None, default: str) -> str:

    if value is None:
        return default

    value = value.strip()

    return value if value else default

def parse_args():
    parser = argparse.ArgumentParser(
        description="Convert a meteorites CSV file to JSON with optional grid filtering."
    )

    parser.add_argument(
        "--input",
        required=True,
        help="Input CSV file path"
    )

    parser.add_argument(
        "--output",
        required=True,
        help="Output JSON file path"
    )

    parser.add_argument(
        "--grid",
        type=float,
        default=0.0,
        help="Grid cell size in degrees (disable grid if <= 0)"
    )

    parser.add_argument(
        "--limit",
        type=int,
        default=0,
        help="Maximum number of records (0 = unlimited)"
    )

    parser.add_argument(
        "--clean-up",
        action="store_true",
        help="Remove meteorites with invalid coordinates (0.0, 0.0 or GeoLocation '(0.0, 0.0)')"
    )

    parser.add_argument(
        "--debug",
        type=int,
        choices=[0, 1, 2],
        default=0,
        help="Debug level: 0 = silent, 1 = info, 2 = verbose"
    )

    return parser.parse_args()


def main():
    args = parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)

    use_grid = args.grid > 0
    use_limit = args.limit > 0

    debug_print(1, args.debug, f"Reading CSV file: {input_path}")

    if not input_path.exists():
        print(f"ERROR: Input file not found: {input_path}", file=sys.stderr)
        sys.exit(1)

    seen_cells = set()
    data_list = []

    with input_path.open(newline="", encoding="utf-8") as csvfile:
        reader = csv.DictReader(csvfile)

        if reader.fieldnames != EXPECTED_FIELDS:
            print("ERROR: CSV header does not match expected format.\n" f"Expected: {EXPECTED_FIELDS}\n" f"Found   : {reader.fieldnames}", file=sys.stderr)
            sys.exit(1)

        for row_index, row in enumerate(reader, start=1):

            if any(field not in row or row[field] is None for field in EXPECTED_FIELDS):
                print(f"ERROR: Invalid row structure at line {row_index + 1}. " "Missing or malformed fields.", file=sys.stderr)
                sys.exit(1)

            if not row["id"].isdigit():
                print(f"ERROR: Invalid id at line {row_index + 1}.", file=sys.stderr)
                sys.exit(1)

            if use_limit and len(data_list) >= args.limit:
                break

            lat_str = (row.get("reclat") or "").strip()
            lon_str = (row.get("reclong") or "").strip()

            lat_val = None
            lon_val = None

            if lat_str != "" and lon_str != "":
                try:
                    lat_val = float(lat_str)
                    lon_val = float(lon_str)
                except ValueError:
                    lat_val = None
                    lon_val = None

            geo_location = row.get("GeoLocation")

            if args.clean_up and is_invalid_location(lat_val, lon_val, geo_location):
                debug_print(2, args.debug, f"Clean-up: removed meteorite ({row.get('name', 'Unknown')}) with invalid or missing location")
                continue

            if use_grid and lat_val is not None and lon_val is not None:
                grid_lat = round(lat_val / args.grid)
                grid_lon = round(lon_val / args.grid)
                cell_key = f"{grid_lat}_{grid_lon}"

                if cell_key in seen_cells:
                    continue

                seen_cells.add(cell_key)

            recclass = row.get("recclass")
            mass = row.get("mass (g)")
            fall = row.get("fall")
            year = row.get("year")

            if args.clean_up:
                recclass = normalize_if_empty(recclass, "Unknown")
                mass = normalize_if_empty(mass, "N/A")
                fall = normalize_if_empty(fall, "Unknown")
                year = normalize_if_empty(year, "Unknown")
            else:
                recclass = recclass or ""
                mass = (mass or "").strip()
                fall = fall or ""
                year = year or ""

            meteorite = {
                "id": row.get("id"),
                "name": row.get("name", "Unknown"),
                "recclass": recclass,
                "mass": mass,
                "fall": fall,
                "year": year,
                "latitude": lat_str,
                "longitude": lon_str,
            }

            data_list.append(meteorite)

            debug_print(
                2,
                args.debug,
                f"Accepted meteorite: {meteorite['name']} ({lat_val}, {lon_val})"
            )

    debug_print(1, args.debug, f"Shuffling {len(data_list)} records")
    random.shuffle(data_list)

    data_dict = {
        "meteorites": {
            f"meteorite_{i + 1}": data
            for i, data in enumerate(data_list)
        }
    }

    debug_print(1, args.debug, f"Writing JSON output: {output_path}")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as f:
        json.dump(data_dict, f, indent=4)

    print(
        "========================================\n"
        "    Export completed successfully\n"
        "----------------------------------------\n"
        f"- Output file path  : {output_path}\n"
        f"- Records exported  : {len(data_list)} meteorites\n"
        f"- Grid filtering    : {'Enabled' if use_grid else 'Disabled'}\n"
        f"- Record limit      : {args.limit if use_limit else 'Unlimited'}\n"
        "========================================"
    )


if __name__ == "__main__":
    main()
