import { Component, Input } from '@angular/core';
import { TimelineEvent } from 'app/models/timeline.model';

@Component({
    selector: 'app-comparative-event',
    imports: [],
    templateUrl: './comparative-event.component.html',
    styleUrl: './comparative-event.component.scss'
})
export class ComparativeEventComponent {
    @Input() event!: TimelineEvent;
}
