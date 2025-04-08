import { Component, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

declare var TL: any;

@Component({
    selector: 'app-tale',
    imports: [],
    templateUrl: './tale.component.html',
    styleUrl: './tale.component.scss'
})
export class TaleComponent implements AfterViewInit {
    private taleData: any;
    private uniqueIds: string[] = [];
    private mainGroup = 'Crow';
    constructor(private http: HttpClient) {}

    ngAfterViewInit(): void {
        this.http.get('tales/tale.json').subscribe({
            next: (data: any) => {
                this.uniqueIds = this.getUniqueIds(data.events);
                this.taleData = data;
                new TL.Timeline('tale', this.taleData);
            },
            error: (error) => {
                console.error('Error loading tale data:', error);
            }
        });
    }

    private getUniqueIds(events: any): string[] {
        const uniqueIds = events.map((event: any, index: number) => {
            if (event.group === this.mainGroup) {
                events[index].unique_id = `${this.mainGroup.toLocaleLowerCase()}-${index}`;
                return events[index].unique_id;
            }
            return null;
        });
        return uniqueIds;
    }
}
