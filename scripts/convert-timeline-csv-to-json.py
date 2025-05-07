#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import csv
import json
import argparse
import os

def convert_csv_to_json(input_file, output_file=None):
    if output_file is None:
        base_name = os.path.splitext(os.path.basename(input_file))[0]
        output_file = f"{base_name}_output.json"

    with open(input_file, 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        rows = list(reader)

    eras = []
    current_era = None
    current_group = None
    last_era_title = None

    # A flag to detect when we need to start a new event group
    building_main = False

    for row in rows:
        era_title = row['Era Title'].strip()
        main_or_comparative = row['Main/Comparative'].strip()

        # -- New era when Era Title changes --
        if not current_era or era_title != last_era_title:
            current_era = {
                'title': {'headline': era_title},
                'mainEventsBackground': {},
                'comparativeEventsBackground': {},
                'eventGroups': []
            }
            if row['Main Background']:
                current_era['mainEventsBackground'] = {'url': row['Main Background']}
            if row['Comparative Background'] or row['Comparative Background Color']:
                current_era['comparativeEventsBackground'] = {
                    'url': row['Comparative Background'],
                    'color': row['Comparative Background Color']
                }
            eras.append(current_era)
            current_group = None
            last_era_title = era_title
            building_main = False

        # Skip purely empty rows
        if not main_or_comparative:
            continue

        # --- Grouping Logic ---
        if main_or_comparative == 'Main':
            if not building_main:
                # Start new eventGroup when a new main block starts
                current_group = {
                    'title': {'headline': row['Group Title'] or ''},  # (optional: generate a title if you want)
                    'mainEvents': [],
                    'comparativeEvents': []
                }
                current_era['eventGroups'].append(current_group)
                building_main = True

            event = {
                'date': row['Event Date'],
                'text': {
                    'brief': row['Event Brief'],
                    'text': row['Event Text'],
                }
            }
            if row['Image URL']:
                event['image'] = {
                    'url': row['Image URL'],
                    'caption': row['Image Caption'],
                    'position': row['Image left|right|top|bottom'],
                }
            current_group['mainEvents'].append(event)

        elif main_or_comparative == 'Comparative':
            if building_main:
                # Switch from building mainEvents to comparativeEvents
                building_main = False

            event = {
                'date': row['Event Date'],
                'text': {
                    'brief': row['Event Brief'],
                    'text': row['Event Text'],
                }
            }
            if row['Image URL']:
                event['image'] = {
                    'url': row['Image URL'],
                    'caption': row['Image Caption'],
                    'position': row['Image left|right|top|bottom'],
                }
            if current_group is None:
                # Defensive check: shouldn't happen, but just in case
                current_group = {
                    'title': {'headline': ''},
                    'mainEvents': [],
                    'comparativeEvents': []
                }
                current_era['eventGroups'].append(current_group)

            current_group['comparativeEvents'].append(event)

    timeline_data = {'eras': eras}

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(timeline_data, f, indent=4, ensure_ascii=False)

    print(f"✅ JSON file created: {output_file}")

def set_up_cmd_line_args():
    parser = argparse.ArgumentParser(description="Convert Timeline CSV into nested JSON grouping by event sequences.")
    parser.add_argument('input_file', help='Path to the input CSV file.')
    parser.add_argument('--output_file', '-o', help='Path to the output JSON file.', default=None)
    return parser

def main():
    parser = set_up_cmd_line_args()
    args = parser.parse_args()

    convert_csv_to_json(args.input_file, args.output_file)

if __name__ == "__main__":
    main()
