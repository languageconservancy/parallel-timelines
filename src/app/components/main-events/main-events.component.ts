import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineEvent } from 'app/models/timeline.model';
import { MainEventComponent } from '../main-event/main-event.component';

@Component({
    selector: 'app-main-events',
    imports: [MainEventComponent, CommonModule],
    templateUrl: './main-events.component.html',
    styleUrl: './main-events.component.scss'
})
export class MainEventsComponent {
    @Input() events!: TimelineEvent[];
    @Input() eventsTitle?: { headline?: string; };
    @Input() eraTitle?: string;
    @ViewChild('scrollRef') scrollRef!: ElementRef;

    onChanges() {
        if (this.scrollRef) {
            this.scrollRef.nativeElement.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
}
