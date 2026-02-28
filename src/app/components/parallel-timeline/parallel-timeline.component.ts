import {
    Component,
    AfterViewInit,
    OnDestroy,
    WritableSignal,
    signal,
    computed,
    ViewChild,
    ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
    TimelineData,
    DrawerCard,
    TimelineEra,
    TimelineFlattenedEventGroup,
    TimelineBackgroundAudio,
} from 'app/models/timeline.model';
import { TimelineEventGroupComponent } from 'app/components/timeline-event-group/timeline-event-group.component';
import { BackgroundComponent } from '../background/background.component';
import { ArrowComponent } from 'app/components/arrow/arrow.component';
import { BottomDrawerComponent } from '../bottom-drawer/bottom-drawer.component';
import { AudioControlsComponent } from '../audio-controls/audio-controls.component';
import { DeviceDetectorService } from 'ngx-device-detector';
import { AudioService } from 'app/services/audio.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-parallel-timeline',
    imports: [
        ArrowComponent,
        BackgroundComponent,
        CommonModule,
        TimelineEventGroupComponent,
        BottomDrawerComponent,
        AudioControlsComponent,
    ],
    templateUrl: './parallel-timeline.component.html',
    styleUrl: './parallel-timeline.component.scss',
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
export class ParallelTimelineComponent implements AfterViewInit, OnDestroy {
    public flattendEventGroups: TimelineFlattenedEventGroup[] = [];
    public previousEraIndex: WritableSignal<number> = signal(-1);
    public currentFlatGroupIndex: WritableSignal<number> = signal(0);
    public currentEra: WritableSignal<TimelineEra> = signal({
        type: '',
        title: { headline: '' },
        mainEventsBackground: { url: '', color: '' },
        comparativeEventsBackground: { url: '', color: '' },
        eventGroups: [],
        backgroundAudios: [],
    });
    private isProgrammaticScroll: boolean = false;
    public drawerCards: DrawerCard[] = [];
    @ViewChild('eraTitleRef') eraTitleRef!: ElementRef<HTMLDivElement>;
    @ViewChild('timelineScrollRef')
    timelineScrollRef!: ElementRef<HTMLDivElement>;
    @ViewChild(BottomDrawerComponent) bottomDrawerRef!: BottomDrawerComponent;
    private scrollTimeout?: number = 0;
    private lastScrollLeft: number = 0;
    private touchStartX: number = 0;
    private touchEndX: number = 0;
    public isMobileOrTablet: boolean = this.deviceService.isMobile() || this.deviceService.isTablet();
    private verticalScrollCounter: number = 0;
    private verticalScrollBuffer: number = 15;
    private timelinePath: string = 'timelines/timeline.json';
    private timelineData: TimelineData | null = null;
    private audioSubscription: Subscription | null = null;

    constructor(
        private http: HttpClient,
        private deviceService: DeviceDetectorService,
        private audioService: AudioService,
    ) {}

    /**
     * Lifecycle hook that is called after the component's view has been fully initialized.
     * This is where we load the timeline data and set up the event groups.
     * It also sets up the scroll event listener for the timeline.
     */
    ngAfterViewInit(): void {
        this.loadTimelineData(this.timelinePath);

        this.handleProgrammaticScrollEnd();

        if (this.isMobileOrTablet) {
            this.listenToTouchEvents();
        } else {
            this.useMouseWheelForTimelineScrolling();
        }
    }

    /**
     * Lifecycle hook that is called when the component is destroyed.
     * This is where we clean up resources and subscriptions.
     */
    ngOnDestroy(): void {
        if (this.audioSubscription) {
            this.audioSubscription.unsubscribe();
        }
        this.audioService.destroy();
    }

    /**
     * Load the timeline data from the JSON file.
     */
    loadTimelineData(timelinePath: string) {
        this.http.get(timelinePath).subscribe({
            next: async (data: any) => {
                // Separate out app background audio from the timeline data
                const appBackgroundAudios = this.separateAppBackgroundAudio(data);
                if (appBackgroundAudios.length > 0) {
                    // Remove app background audio era from the timeline data, since it's not a real era
                    data.eras.splice(0, 1);
                }

                const parsedData = this.setIds(data);
                this.timelineData = parsedData;
                this.setFlattendEventGroups(parsedData);
                this.createDrawerCards(parsedData);

                // Initialize app background audio
                await this.audioService.initializeAppBackgroundAudio(appBackgroundAudios);

                // Set the current era to the first one
                if (this.flattendEventGroups?.[0]) {
                    await this.updateCurrentFlatGroup(0);
                }
            },
            error: (error) => {
                console.error('Error loading tale data:', error);
            },
        });
    }

    /**
     * Separate out app background audio from the timeline data.
     * @param {TimelineData} data - The timeline data
     * @returns {TimelineBackgroundAudio[]} - The app background audio
     */
    separateAppBackgroundAudio(data: TimelineData): TimelineBackgroundAudio[] {
        const appBackgroundAudio = data.eras.find(
            (era) => era.title?.headline === 'appBackgroundAudio',
        )?.backgroundAudios;
        return appBackgroundAudio || [];
    }

    /**
     * Handle the end of programmatic scrolling.
     * This is used to reset the isProgrammaticScroll flag after a timeout.
     * This is to prevent the scroll event from being triggered when the user is
     * scrolling the timeline programmatically.
     */
    handleProgrammaticScrollEnd() {
        this.timelineScrollRef.nativeElement.addEventListener('scroll', (event) => {
            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = window.setTimeout(() => {
                this.isProgrammaticScroll = false;
            }, 100); // Adjust this timeout for sensitivity (100-300ms is usually good)
        });
    }

    /**
     * Use the mouse wheel to scroll the timeline.
     */
    useMouseWheelForTimelineScrolling() {
        this.timelineScrollRef.nativeElement.addEventListener('wheel', async (event: WheelEvent) => {
            if (this.isProgrammaticScroll) {
                return;
            }
            const target = event.target as HTMLElement;
            const verticalScrollArea = target.closest('.vertical-scroll-area') as HTMLElement | null;

            if (verticalScrollArea && this.isVerticallyScrollable(target)) {
                if (!this.isVerticallyScrollableAreaFullyScrolled(verticalScrollArea, event.deltaY)) {
                    return;
                } else {
                    // Allow mild overscrolling to prevent unintended horitonzal scrolling
                    this.verticalScrollCounter++;
                    if (this.verticalScrollCounter < this.verticalScrollBuffer) {
                        return;
                    }
                    this.verticalScrollCounter = 0;
                }
            }

            // Make sure scroll is valid
            if (event.deltaY === 0) {
                return;
            }

            event.preventDefault();
            const delta = Math.sign(event.deltaY);
            const newGroupIndex = Math.max(
                Math.min(this.currentFlatGroupIndex() + delta, this.flattendEventGroups.length - 1),
                0,
            );
            await this.updateCurrentFlatGroup(newGroupIndex);
            this.scrollToGroup(newGroupIndex);
            // Force scroll of one page at a time
            this.scrollTimeout = window.setTimeout(() => {
                this.isProgrammaticScroll = false;
            }, 100); // Adjust this timeout for sensitivity (100-300ms is usually good)
        });
    }

    /**
     * Check if the element is vertically scrollable.
     * @param {HTMLElement} el - The element to check
     * @returns {boolean} - True if the element is vertically scrollable, false otherwise
     */
    isVerticallyScrollable(el: HTMLElement): boolean {
        while (el && el !== document.body) {
            const style = window.getComputedStyle(el);
            if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
                return true;
            }
            el = el.parentElement!;
        }
        return false;
    }

    /**
     * Check if the element is fully scrolled vertically.
     * @param {HTMLElement} el - The element to check
     * @param {number} deltaY - The vertical scroll delta
     * @returns {boolean} - True if the element is fully scrolled, false otherwise
     */
    isVerticallyScrollableAreaFullyScrolled(el: HTMLElement, deltaY: number): boolean {
        const atTop = el.scrollTop === 0;
        const atBottom = Math.ceil(el.scrollTop + el.clientHeight) >= el.scrollHeight;
        const scrollingDown = deltaY > 0;
        const scrollingUp = deltaY < 0;
        const cannotScrollVertically = (scrollingDown && atBottom) || (scrollingUp && atTop);
        return cannotScrollVertically;
    }

    /**
     * Listen to touch events for mobile devices.
     * This is used to manually handle swipe gestures for scrolling the timeline,
     * since mobile swipe results in scrolling many pages at once.
     */
    listenToTouchEvents() {
        this.timelineScrollRef.nativeElement.addEventListener(
            'touchstart',
            (e: TouchEvent) => {
                this.touchStartX = e.changedTouches[0].screenX;
            },
            { passive: false },
        );

        this.timelineScrollRef.nativeElement.addEventListener(
            'touchmove',
            (e: TouchEvent) => {
                const target = e.target as HTMLElement;

                // don't prevent vertical scroll in designated areas
                if (target.closest('.vertical-scroll-area')) {
                    return;
                }

                e.preventDefault(); // prevent scrolling
            },
            { passive: false },
        );

        this.timelineScrollRef.nativeElement.addEventListener(
            'touchend',
            (e: TouchEvent) => {
                this.touchEndX = e.changedTouches[0].screenX;
                this.handleSwipeGesture();
            },
            { passive: false },
        );
    }

    /**
     * Handle swipe gestures for mobile devices.
     * This is used to manually handle swipe gestures for scrolling the timeline,
     * since mobile swipe results in scrolling many pages at once.
     */
    handleSwipeGesture() {
        const deltaX = this.touchEndX - this.touchStartX;
        if (deltaX > 40) {
            this.onArrowClick('left').catch(console.error);
        } else if (deltaX < -40) {
            this.onArrowClick('right').catch(console.error);
        }
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
                return [
                    {
                        id: -1,
                        eraId: era.id,
                        eraTitle: era.title,
                        type: 'titlePage',
                        mainEventsBackground: era.mainEventsBackground ?? undefined,
                        comparativeEventsBackground: era.comparativeEventsBackground ?? undefined,
                        mainEvents: [],
                        comparativeEvents: [],
                    },
                ];
            }

            return groups.map((group) => ({
                ...group,
                eraId: era.id,
                type: 'eventGroups',
                eraTitle: era.title,
                mainEventsBackground: era.mainEventsBackground ?? undefined,
                comparativeEventsBackground: era.comparativeEventsBackground ?? undefined,
            }));
        });
    }

    /**
     * Set IDs for the timeline data.
     * @param {TimelineData} data - The timeline data
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
            background: era.mainEventsBackground || { url: '', color: '' },
        }));
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

        // Don't programmatically scroll if the user has scrolled less than 25% of the group width
        const minDelta = groupWidth * 0.25;
        if (Math.abs(scrollLeft - this.lastScrollLeft) < minDelta) {
            return;
        }

        // Store the current group index
        const lastGroupIndex = this.currentFlatGroupIndex();

        // Calculate the current group index based on the scroll position
        let currentGroupIndex: number = Math.round(scrollLeft / groupWidth);

        const maxJump = 1;
        if (Math.abs(currentGroupIndex - lastGroupIndex) > maxJump) {
            currentGroupIndex = lastGroupIndex + Math.sign(currentGroupIndex - lastGroupIndex) * maxJump;
        }

        const currentGroup: TimelineFlattenedEventGroup = this.flattendEventGroups?.[currentGroupIndex];

        if (currentGroup && currentGroupIndex !== lastGroupIndex) {
            this.updateCurrentFlatGroup(currentGroupIndex).catch(console.error);
        }

        this.lastScrollLeft = scrollLeft;
    }

    /**
     * Update the current era based on the index of the event group
     * @param {number} index - The index of the event group
     */
    async updateCurrentFlatGroup(index: number) {
        const eventGroup = this.flattendEventGroups?.[index];
        if (!eventGroup) {
            return;
        }

        // Get the current era data for audio handling
        const currentEraData = this.timelineData?.eras.find((era) => era.id === eventGroup.eraId);

        // Handle audio change when era changes
        if (currentEraData) {
            const eraAudio = currentEraData.backgroundAudios || []; // Use first era audio if available

            await this.audioService.handleEraChange(eraAudio);
        }

        this.currentEra.set({
            id: eventGroup.eraId,
            type: eventGroup.type,
            title: eventGroup.eraTitle,
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
    async onArrowClick(direction: 'left' | 'right') {
        if (!this.flattendEventGroups) {
            return;
        }

        const newGroupIndex =
            direction === 'left'
                ? Math.max(this.currentFlatGroupIndex() - 1, 0)
                : Math.min(this.currentFlatGroupIndex() + 1, this.flattendEventGroups.length - 1);
        await this.updateCurrentFlatGroup(newGroupIndex);
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
    async onDrawerEraClick(index: number) {
        if (!this.flattendEventGroups) {
            return;
        }

        await this.updateCurrentFlatGroup(index);
        this.scrollToGroup(index);
    }

    /**
     * Handle the click event for the era title
     */
    onEraTitleClick() {
        console.log('onEraTitleClick');
        this.bottomDrawerRef.toggleDrawerVisibility();
    }
}
