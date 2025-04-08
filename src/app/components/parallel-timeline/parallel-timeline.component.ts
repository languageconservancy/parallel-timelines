import { Component, AfterViewInit, WritableSignal, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TimelineData, DrawerCard, TimelineEra, TimelineFlattenedEventGroup } from 'app/models/timeline.model';
import { TimelineEventGroupComponent } from 'app/components/timeline-event-group/timeline-event-group.component';
import { BackgroundComponent } from '../background/background.component';
import { ArrowComponent } from 'app/components/arrow/arrow.component';
import { BottomDrawerComponent } from "../bottom-drawer/bottom-drawer.component";

@Component({
    selector: 'app-parallel-timeline',
    imports: [
        ArrowComponent,
        BackgroundComponent,
        CommonModule,
        TimelineEventGroupComponent,
        BottomDrawerComponent
    ],
    templateUrl: './parallel-timeline.component.html',
    styleUrl: './parallel-timeline.component.scss'
})
/**
 * Main features:
 * - Eras: Periods that span many years
 *    - background: background image for the era
 *    - title: title of the era
 * - EventGroups: Groups of events that are related
 *    - title: header text for the event group
 *    - main_events: list of events in the group
 *    - comparative_events: list of events in the group
 * - Events: Individual events
 *    - title: title of the event
 *    - start_date: start date of the event
 *    - end_date: end date of the event
 *    - media: media associated with the event
 * - Media: Images, videos, audio, etc.
 *    - type: type of media (image, video, audio)
 *    - url: URL of the media
 * - Navbar: Navigation bar for the timeline
 *    - items: title of the timeline
 * - Navbar Item: Individual items in the navigation bar
 *    - title: title of the item
 *    - image: image associated with the item
 */
export class ParallelTimelineComponent implements AfterViewInit {
    public flattendEventGroups: TimelineFlattenedEventGroup[] = [];
    public previousEraIndex: WritableSignal<number> = signal(-1);
    public currentFlatGroupIndex: WritableSignal<number> = signal(0);
    public currentEra: WritableSignal<TimelineEra> = signal({
        type: '',
        title: { headline: '' },
        singleBackground: { url: '', color: '' },
        mainEventsBackground: { url: '', color: '' },
        comparativeEventsBackground: { url: '', color: '' },
        eventGroups: [],
    });
    private isProgrammaticScroll: boolean = false;
    public drawerCards: DrawerCard[] = [];
    @ViewChild('eraTitleRef') eraTitleRef!: ElementRef<HTMLDivElement>;
    @ViewChild('timelineScrollRef') timelineScrollRef!: ElementRef<HTMLDivElement>;

    constructor(private http: HttpClient) {}

    ngAfterViewInit(): void {
        this.http.get('tales/tale-custom.json').subscribe({
            next: (data: any) => {
                data = this.setIds(data);
                this.setFlattendEventGroups(data);
                this.createDrawerCards(data);
                // Set the current era to the first one
                if (this.flattendEventGroups?.[0]) {
                    this.updateCurrentFlatGroup(0);
                }
            },
            error: (error) => {
                console.error('Error loading tale data:', error);
            }
        });

        const el = this.timelineScrollRef.nativeElement;
        el.addEventListener('scrollend', () => {
            this.isProgrammaticScroll = false;
        })
    }

    setFlattendEventGroups(timeline: TimelineData) {
        if (!timeline) {
            return;
        }

        this.flattendEventGroups = timeline?.eras.flatMap((era) => {
            const groups = era.eventGroups ?? [];

            if (groups.length === 0) {
                return [{
                    id: -1,
                    eraId: era.id,
                    eraTitle: era.title,
                    type: "titlePage",
                    singleBackground: era.singleBackground ?? undefined,
                    mainEventsBackground: era.mainEventsBackground ?? undefined,
                    comparativeEventsBackground: era.comparativeEventsBackground ?? undefined,
                    mainEvents: [],
                    comparativeEvents: [],
                }];
            }

            return groups.map((group) => ({
                ...group,
                eraId: era.id,
                type: "eventGroups",
                eraTitle: era.title,
                singleBackground: era.singleBackground ?? undefined,
                mainEventsBackground: era.mainEventsBackground ?? undefined,
                comparativeEventsBackground: era.comparativeEventsBackground ?? undefined,
            }))
        });

        console.debug("Flattend event groups:", this.flattendEventGroups);
    }

    setIds(data: TimelineData) {
        let eraId = 0;
        let groupId = 0;
        let eventId = 0;
        for (const era of data.eras) {
            era.id = eraId++;
            const eventGroups = era.eventGroups ?? [];
            for (const group of eventGroups) {
                group.id = groupId++;

                const mainEvents = group.mainEvents ?? [];
                for (const event of mainEvents) {
                    event.id = eventId++;
                }

                const comparativeEvents = group.comparativeEvents ?? [];
                for (const event of comparativeEvents) {
                    event.id = eventId++;
                }
            }
        }

        return data;
    }

    createDrawerCards(timeline: TimelineData) {
        this.drawerCards = timeline.eras.map((era) => ({
            id: era.id ?? 0,
            title: era.title?.headline ?? '',
            eventGroupIndex: this.flattendEventGroups.findIndex((group) => group.eraId === era.id),
            background: era.singleBackground || era.mainEventsBackground || { url: '', color: '' },
        }));
    }

    onTimelineScroll(event: Event) {
        if (!this.flattendEventGroups || this.isProgrammaticScroll) {
            return;
        }

        // How far the user has scrolled
        const scrollLeft = (event.target as HTMLElement).scrollLeft;
        // Get width of an event group, which is the window width
        const groupWidth = window.innerWidth;

        // Calculate the current group index based on the scroll position
        const currentGroupIndex: number = Math.round(scrollLeft / groupWidth);
        const currentGroup: TimelineFlattenedEventGroup = this.flattendEventGroups?.[currentGroupIndex];

        if (currentGroup && currentGroup.eraId !== this.currentEra().id) {
            this.updateCurrentFlatGroup(currentGroupIndex);
        }
    }

    updateCurrentFlatGroup(index: number) {
        const eventGroup = this.flattendEventGroups?.[index];
        if (!eventGroup) {
            return;
        }

        this.currentEra.set({
            id: eventGroup.eraId,
            type: eventGroup.type,
            title: eventGroup.eraTitle,
            singleBackground: eventGroup.singleBackground,
            mainEventsBackground: eventGroup.mainEventsBackground,
            comparativeEventsBackground: eventGroup.comparativeEventsBackground,
            eventGroups: [],
        });

        this.previousEraIndex.set(this.currentFlatGroupIndex());
        this.currentFlatGroupIndex.set(index);
    }

    onArrowClick(direction: 'left' | 'right') {
        if (!this.flattendEventGroups) {
            return;
        }

        const newGroupIndex = direction === 'left'
            ? Math.max(this.currentFlatGroupIndex() - 1, 0)
            : Math.min(this.currentFlatGroupIndex() + 1, this.flattendEventGroups.length - 1);
        this.updateCurrentFlatGroup(newGroupIndex);
        this.scrollToGroup(newGroupIndex);
    }

    scrollToGroup(index: number) {
        this.isProgrammaticScroll = true;

        const groupWidth = window.innerWidth;
        this.timelineScrollRef.nativeElement.scrollTo({
            left: groupWidth * index,
            behavior: 'smooth',
        });
    }

    onDrawerEraClick(index: number) {
        if (!this.flattendEventGroups) {
            return;
        }

        this.updateCurrentFlatGroup(index);
        this.scrollToGroup(index);
    }
}
