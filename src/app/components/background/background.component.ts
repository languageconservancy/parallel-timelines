import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineBackground } from 'app/models/timeline.model';

@Component({
    selector: 'app-background',
    imports: [CommonModule],
    templateUrl: './background.component.html',
    styleUrl: './background.component.scss'
})
export class BackgroundComponent implements OnChanges {
    @Input() eraType?: string = '';
    @Input() mainEventsBackground?: TimelineBackground = { url: '', color: '', credit: '' };
    @Input() comparativeEventsBackground?: TimelineBackground = { url: '', color: '' };

    ngOnChanges(): void {
        if (this.mainEventsBackground) {
            console.log('mainEventsBackground', this.mainEventsBackground);
        }
    }
}
