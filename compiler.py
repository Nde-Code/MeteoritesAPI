#!/usr/bin/env python3
import csv
import json
import argparse
import random
import sys
from pathlib import Path

def debug_print(level: int, current: int, message: str):
    if current >= level:
        print(message)


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

        for row_index, row in enumerate(reader, start=1):

            if use_limit and len(data_list) >= args.limit:
                break

            lat_str = (row.get("reclat") or "").strip()
            lon_str = (row.get("reclong") or "").strip()

            if not lat_str or not lon_str:
                continue

            try:
                lat_val = float(lat_str)
                lon_val = float(lon_str)
            except ValueError:
                continue

            if lat_val == 0.0 or lon_val == 0.0:
                continue

            if use_grid:
                grid_lat = round(lat_val / args.grid)
                grid_lon = round(lon_val / args.grid)
                cell_key = f"{grid_lat}_{grid_lon}"

                if cell_key in seen_cells:
                    continue

                seen_cells.add(cell_key)

            meteorite = {
                "id": row.get("id", "N/A"),
                "name": row.get("name", "Unknown"),
                "recclass": row.get("recclass", "Unknown"),
                "mass": (row.get("mass (g)") or "").strip() or "N/A",
                "fall": row.get("fall", "Unknown"),
                "year": row.get("year", "N/A"),
                "latitude": lat_str,
                "longitude": lon_str,
            }

            data_list.append(meteorite)

            debug_print(
                2,
                args.debug,
                f"Accepted row {row_index}: {meteorite['name']} ({lat_val}, {lon_val})"
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
        "\n========================================\n"
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
