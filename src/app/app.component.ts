import { Component, OnInit } from '@angular/core';
import { ParallelTimelineComponent } from 'app/components/parallel-timeline/parallel-timeline.component';
import { ConfigService } from 'app/services/config.service';

@Component({
    selector: 'app-root',
    imports: [
        ParallelTimelineComponent,
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
    constructor(private configService: ConfigService) {}

    ngOnInit() {
        this.configService.loadAppConfig();
    }

}
