import csv
import json
import argparse
import os

def convert_csv_to_json(input_file, output_file=None):
    # Set default output filename if not provided
    if output_file is None:
        base_name = os.path.splitext(os.path.basename(input_file))[0]
        output_file = f"{base_name}_output.json"

    with open(input_file, 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        rows = list(reader)

    eras = []
    current_era = None
    current_group = None

    for row in rows:
        era_title = row['Era Title'].strip()
        group_title = row['Group Title'].strip()
        main_or_comparative = row['Main/Comparative'].strip()

        # New era if needed
        if not current_era or current_era['title']['headline'] != era_title:
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
            current_group = None  # reset group at new era

        # Some rows could just be era info without events
        if not group_title and not main_or_comparative:
            continue

        # New group if needed
        if not current_group or current_group['title']['headline'] != group_title:
            current_group = {
                'title': {'headline': group_title},
                'mainEvents': [],
                'comparativeEvents': []
            }
            current_era['eventGroups'].append(current_group)

        # Build event
        print(row['Event Date'])
        event = {
            'date': row['Event Date'],
            'text': {
                'brief': row['Event Brief'],
                'text': row['Event Text'],
            }
        }

        # Add image if it exists
        if row['Image URL']:
            event['image'] = {
                'url': row['Image URL'],
                'caption': row['Image Caption'],
                'position': row['Image left|right|top|bottom'],
            }

        if main_or_comparative == 'Main':
            current_group['mainEvents'].append(event)
        elif main_or_comparative == 'Comparative':
            current_group['comparativeEvents'].append(event)

    # Build final object
    timeline_data = {'eras': eras}

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(timeline_data, f, indent=4, ensure_ascii=False)

    print(f"✅ JSON file created: {output_file}")

def set_up_cmd_line_args():
    parser = argparse.ArgumentParser(description="Convert flat Timeline CSV back into nested JSON.")
    parser.add_argument('input_file', help='Path to the input CSV file.')
    parser.add_argument('--output_file', '-o', help='Path to the output JSON file.', default=None)
    return parser

def main():
    parser = set_up_cmd_line_args()
    args = parser.parse_args()

    convert_csv_to_json(args.input_file, args.output_file)

if __name__ == "__main__":
    main()
