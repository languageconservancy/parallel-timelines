import { Component, Input } from '@angular/core';
import { TimelineEvent } from 'app/models/timeline.model';

@Component({
    selector: 'app-main-event',
    imports: [],
    templateUrl: './main-event.component.html',
    styleUrl: './main-event.component.scss'
})
export class MainEventComponent {
    @Input() event!: TimelineEvent;
}
