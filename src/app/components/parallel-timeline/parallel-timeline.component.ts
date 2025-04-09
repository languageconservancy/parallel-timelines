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
 * - Bottom Drawer: Navigation bar for the timeline
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
    private scrollTimeout?: number = 0;

    constructor(private http: HttpClient) {}

    /**
     * Lifecycle hook that is called after the component's view has been fully initialized.
     * This is where we load the timeline data and set up the event groups.
     * It also sets up the scroll event listener for the timeline.
     */
    ngAfterViewInit(): void {
        this.http.get('timelines/timeline.json').subscribe({
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

        this.timelineScrollRef.nativeElement.addEventListener('scroll', (event) => {
            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = window.setTimeout(() => {
                console.debug('scroll done');
                this.isProgrammaticScroll = false;
            }, 100); // Adjust this timeout for sensitivity (100-300ms is usually good)
        })
    }

    /**
     * Set the flattend event groups based on the timeline data.
     * This function flattens the event groups into a single array, which is used for
     * displaying the timeline.
     * @param {TimelineDate} timeline - The timeline data
     */
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

    /**
     * Set IDs for the timeline data.
     * @param data - The timeline data
     * @returns The timeline data with IDs set
     */
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

    /**
     * Create the drawer cards based on the timeline data, to be used by the child component.
     * @param {TimelineData} timeline - The timeline data
     */
    createDrawerCards(timeline: TimelineData) {
        this.drawerCards = timeline.eras.map((era) => ({
            id: era.id ?? 0,
            title: era.title?.headline ?? '',
            eventGroupIndex: this.flattendEventGroups.findIndex((group) => group.eraId === era.id),
            background: era.singleBackground || era.mainEventsBackground || { url: '', color: '' },
        }));
    }

    /**
     * Handle the swipe left event
     * @param {Event} event: The swipe event
     * @param {EventTarget} event.target: The element that was swiped
     * @param {number} event.target.scrollLeft: The amount the element has been scrolled
     */
    onSwipeLeft(event: Event) {
        console.debug("onSwipeLeft", event);
    }

    /**
     * Handle the swipe right event
     * @param {Event} event: The swipe event
     * @param {EventTarget} event.target: The element that was swiped
     * @param {number} event.target.scrollLeft: The amount the element has been scrolled
     */
    onSwipeRight(event: Event) {
        console.debug("onSwipeRight", event);
    }

    /**
     * Based on the scroll position of the timeline, update the current era to
     * the one that is currently in view.
     * @param {Event} event: The scroll event
     * @param {EventTarget} event.target: The element that was scrolled
     * @param {number} event.target.scrollLeft: The amount the element has been scrolled
     */
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

        if (currentGroup && currentGroupIndex !== this.currentFlatGroupIndex()) {
            console.debug("onScroll, going from group ", this.currentFlatGroupIndex(), " -> ", currentGroupIndex);
            this.updateCurrentFlatGroup(currentGroupIndex);
        }
    }

    /**
     * Update the current era based on the index of the event group
     * @param {number} index - The index of the event group
     */
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

    /**
     * Handle the click event for the left and right arrows
     * @param {string} direction - The direction to scroll in, either 'left' or 'right'
     */
    onArrowClick(direction: 'left' | 'right') {
        if (!this.flattendEventGroups) {
            return;
        }

        const newGroupIndex = direction === 'left'
            ? Math.max(this.currentFlatGroupIndex() - 1, 0)
            : Math.min(this.currentFlatGroupIndex() + 1, this.flattendEventGroups.length - 1);
        console.debug("Going from group ", this.currentFlatGroupIndex(), " -> ", newGroupIndex);
        this.updateCurrentFlatGroup(newGroupIndex);
        this.scrollToGroup(newGroupIndex);
    }

    /**
     * Scroll to the specified event group by index.
     * @param {number} index - The index of the event group to scroll to
     */
    scrollToGroup(index: number) {
        this.isProgrammaticScroll = true;

        const groupWidth = window.innerWidth;
        this.timelineScrollRef.nativeElement.scrollTo({
            left: groupWidth * index,
            behavior: 'smooth',
        });
    }

    /**
     * Handle the click event for the drawer cards
     * @param {number} index - The index of the drawer card that was clicked
     */
    onDrawerEraClick(index: number) {
        if (!this.flattendEventGroups) {
            return;
        }

        this.updateCurrentFlatGroup(index);
        this.scrollToGroup(index);
    }
}
