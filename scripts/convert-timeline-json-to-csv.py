#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import csv
import argparse
import os

def convert_json_to_csv(input_file):
    # Load your JSON
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Create output filename based on input
    base_name = os.path.splitext(os.path.basename(input_file))[0]
    output_file = f"{base_name}_output.csv"

    fieldnames = [
        'Order',
        'Era Title',
        'Main Background',
        'Comparative Background',
        'Comparative Background Color',
        'Group Title',
        'Main/Comparative',
        'Event Date',
        'Event Brief',
        'Event Text',
        'Image URL',
        'Image Caption',
        'Image left|right|top|bottom',
    ]

    with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        order = 1

        for era in data.get('eras', []):
            era_title = era.get('title', {}).get('headline', '')
            main_background = era.get('mainEventsBackground', {}).get('url', '')
            comparative_background = era.get('comparativeEventsBackground', {}).get('url', '')
            comparative_background_color = era.get('comparativeEventsBackground', {}).get('color', '')

            if not era.get('eventGroups', []):
                writer.writerow({
                    'Order': order,
                    'Era Title': era_title,
                    'Main Background': main_background,
                })
                order += 1
                continue

            for group in era.get('eventGroups', []):
                group_title = group.get('title', {}).get('headline', '')

                # Handle main events
                for event in group.get('mainEvents', []):
                    writer.writerow({
                        'Order': order,
                        'Era Title': era_title,
                        'Main Background': main_background,
                        'Comparative Background': comparative_background,
                        'Comparative Background Color': comparative_background_color,
                        'Group Title': group_title,
                        'Main/Comparative': 'Main',
                        'Event Date': event.get('date', ''),
                        'Event Brief': event.get('text', {}).get('brief', ''),
                        'Event Text': event.get('text', {}).get('text', ''),
                        'Image URL': event.get('image', {}).get('url', ''),
                        'Image Caption': event.get('image', {}).get('caption', ''),
                        'Image left|right|top|bottom': event.get('image', {}).get('position', ''),
                    })
                    order += 1

                # Handle comparative events
                for event in group.get('comparativeEvents', []):
                    writer.writerow({
                        'Order': order,
                        'Era Title': era_title,
                        'Main Background': main_background,
                        'Comparative Background': comparative_background,
                        'Comparative Background Color': comparative_background_color,
                        'Group Title': group_title,
                        'Main/Comparative': 'Comparative',
                        'Event Date': event.get('date', ''),
                        'Event Brief': event.get('text', {}).get('brief', ''),
                        'Event Text': event.get('text', {}).get('text', ''),
                        'Image URL': event.get('image', {}).get('url', ''),
                        'Image Caption': event.get('image', {}).get('caption', ''),
                        'Image left|right|top|bottom': event.get('image', {}).get('position', ''),
                    })
                    order += 1

    print(f"✅ CSV file created: {output_file}")

def set_up_cmd_line_args():
    parser = argparse.ArgumentParser(description="Convert nested JSON (eras, events) to flat CSV for editing.")
    # Positional arguments
    parser.add_argument('input_file', help='Path to the input JSON file.')
    # Optional arguments
    parser.add_argument('--output_file', '-o', help='Path to the output CSV file.', default=None)
    return parser

def main():
    parser = set_up_cmd_line_args()
    args = parser.parse_args()

    convert_json_to_csv(args.input_file)

if __name__ == "__main__":
    main()
