import { Component, signal } from '@angular/core';
import { TaleComponent } from './components/tale/tale.component';
import { ParallelTimelineComponent } from './components/parallel-timeline/parallel-timeline.component';

@Component({
    selector: 'app-root',
    imports: [
        TaleComponent,
        ParallelTimelineComponent,
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
    title = 'swipe-tale';
    public appType = signal('swipe-tale');
}
