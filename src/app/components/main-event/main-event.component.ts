import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineEvent } from 'app/models/timeline.model';

const ValidImagePositions = ['left', 'right', 'top', 'bottom'];

@Component({
    selector: 'app-main-event',
    imports: [CommonModule],
    templateUrl: './main-event.component.html',
    styleUrl: './main-event.component.scss'
})
export class MainEventComponent {
    @Input() event!: TimelineEvent;

    ngAfterViewInit() {
        if (this.event.image) {
            if (!this.event.image.position) {
                throw new Error('Event image position is required' + this.event.image.url);
            } else if (ValidImagePositions.indexOf(this.event.image.position) === -1) {
                throw new Error('Event image position is invalid: ' + this.event.image.position);
            }
        }
    }
}
