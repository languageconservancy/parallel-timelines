import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineFlattenedEventGroup } from 'app/models/timeline.model';
import { MainEventsComponent } from "../main-events/main-events.component";
import { ComparativeEventsComponent } from '../comparative-events/comparative-events.component';

@Component({
    selector: 'app-timeline-event-group',
    imports: [CommonModule, MainEventsComponent, ComparativeEventsComponent],
    templateUrl: './timeline-event-group.component.html',
    styleUrl: './timeline-event-group.component.scss'
})
export class TimelineEventGroupComponent {
    @Input() group!: TimelineFlattenedEventGroup;
    @Input() eraTitle?: string;
}
