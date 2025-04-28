import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineBackground } from 'app/models/timeline.model';

@Component({
    selector: 'app-background',
    imports: [CommonModule],
    templateUrl: './background.component.html',
    styleUrl: './background.component.scss'
})
export class BackgroundComponent {
    @Input() eraType?: string = '';
    @Input() mainEventsBackground?: TimelineBackground = { url: '', color: '' };
    @Input() comparativeEventsBackground?: TimelineBackground = { url: '', color: '' };
}
