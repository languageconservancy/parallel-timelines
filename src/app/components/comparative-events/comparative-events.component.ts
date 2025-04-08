import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineBackground, TimelineEvent } from 'app/models/timeline.model';
import { ComparativeEventComponent } from '../comparative-event/comparative-event.component';

@Component({
    selector: 'app-comparative-events',
    imports: [ComparativeEventComponent, CommonModule],
    templateUrl: './comparative-events.component.html',
    styleUrl: './comparative-events.component.scss'
})
export class ComparativeEventsComponent {
    @Input() events!: TimelineEvent[];
    @Input() background?: TimelineBackground;

    getGridColsClass() {
        return `grid-cols-${this.events.length}`;
    }
}
