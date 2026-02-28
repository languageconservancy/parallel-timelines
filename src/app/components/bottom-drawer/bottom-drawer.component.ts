import {
    Component,
    Input,
    Output,
    EventEmitter,
    ViewChild,
    ElementRef,
    SimpleChanges,
    HostListener,
    AfterViewInit,
    NgZone,
    QueryList,
    ViewChildren,
    OnChanges,
    ChangeDetectorRef,
} from '@angular/core';
import { take } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { DrawerCard } from 'app/models/timeline.model';

@Component({
    selector: 'app-bottom-drawer',
    imports: [CommonModule],
    templateUrl: './bottom-drawer.component.html',
    styleUrl: './bottom-drawer.component.scss',
})
export class BottomDrawerComponent implements OnChanges, AfterViewInit {
    // This component is used to display the bottom drawer of the timeline
    // It contains a horizontally scrollable list of items where each item
    // represents a timeline era (title and background image)
    // The user has to tap on the bottom of the screen or click on the visiable up arrow button
    // to get the bar to slide up and be visible and scrollable.
    // Clicking on that button again will hide the bar and the button
    @Input() currentEraIndex?: number = 0;
    @Input() eras: DrawerCard[] = [];
    @Output() eraClicked = new EventEmitter<number>();
    @ViewChild('drawerScrollRef') drawerScrollRef!: ElementRef<HTMLDivElement>;
    @ViewChildren('eraButtonRef') eraButtonRef!: QueryList<ElementRef<HTMLDivElement>>;
    public isOpen: boolean = true;
    public leftPadding: string = '0px'; //`${window.innerWidth}px`;
    public rightPadding: string = '0px'; //`${window.innerWidth}px`;
    public drawerWidth: string = '100vh'; //`${window.innerWidth}px`;
    @HostListener('window:resize')
    onResize() {
        this.calculateSidePadding();
    }

    constructor(private cdr: ChangeDetectorRef) {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes['currentEraIndex'] && !changes['currentEraIndex'].firstChange) {
            this.scrollToEraButton(this.currentEraIndex);
        }
    }

    ngAfterViewInit(): void {
        this.eraButtonRef.changes.pipe(take(1)).subscribe(() => {
            this.calculateSidePadding();
            this.scrollToEraButton(this.currentEraIndex);
        });

        this.enableHorizontalScrollOnMouseWheel();
        this.enableDragScroll();
    }

    private enableHorizontalScrollOnMouseWheel() {
        const drawerScrollEl = this.drawerScrollRef.nativeElement as HTMLElement;
        if (!drawerScrollEl) {
            console.warn('No drawer scroll ref found');
            return;
        }
        drawerScrollEl.addEventListener(
            'wheel',
            (event: WheelEvent) => {
                if (event.deltaY === 0) {
                    return;
                }

                event.preventDefault();
                drawerScrollEl.scrollLeft += event.deltaY;
            },
            { passive: false },
        );
    }

    private enableDragScroll() {
        const drawerScrollEl = this.drawerScrollRef.nativeElement as HTMLElement;
        if (!drawerScrollEl) {
            console.warn('No drawer scroll ref found');
            return;
        }

        let isDown = false;
        let startX: number;
        let scrollLeft: number;

        drawerScrollEl.addEventListener('mousedown', (event: MouseEvent) => {
            isDown = true;
            drawerScrollEl.classList.add('dragging');
            startX = event.pageX - drawerScrollEl.offsetLeft;
            scrollLeft = drawerScrollEl.scrollLeft;
        });

        drawerScrollEl.addEventListener('mouseleave', () => {
            isDown = false;
            drawerScrollEl.classList.remove('dragging');
        });

        drawerScrollEl.addEventListener('mouseup', () => {
            isDown = false;
            drawerScrollEl.classList.remove('dragging');
        });

        drawerScrollEl.addEventListener('mousemove', (event: MouseEvent) => {
            if (!isDown) return;
            event.preventDefault();
            const x = event.pageX - drawerScrollEl.offsetLeft;
            const walk = (x - startX) * 2; // Adjust scroll speed
            drawerScrollEl.scrollLeft = scrollLeft - walk;
        });
    }

    public drawerTabClicked() {
        // This method is called when the user clicks on a nav tab
        // It sets the current era index to the index of the clicked tab
        // and scrolls to that tab
        this.isOpen = !this.isOpen;
    }

    public closeDrawer() {
        // This method is called when the user clicks on the close button
        // It hides the navigation bar
        this.isOpen = false;
    }

    public openDrawer() {
        // This method is called when the user clicks on the open button
        // It shows the navigation bar
        this.isOpen = true;
    }

    public onEraClick(eventGroupIndex: number) {
        // This method is called when the user clicks on an era
        // It sets the current era index to the index of the clicked era
        this.eraClicked.emit(eventGroupIndex);
        this.isOpen = false;
    }

    public getModifiedEraTitle(eraTitle: string): string {
        // This method is called to get the modified era title
        // It removes the "Timeline" prefix from the title
        return eraTitle.substring(0, 16) + (eraTitle.length > 16 ? '...' : '');
    }

    public scrollToEraButton(eraIndex?: number) {
        if (eraIndex === undefined || eraIndex === null) {
            return;
        }

        // This method is called to scroll to the clicked era
        // It sets the current era index to the index of the clicked era
        const drawer = this.drawerScrollRef.nativeElement as HTMLElement;
        if (!drawer) {
            console.warn('No drawer found');
            return;
        }
        const innerRow = drawer.firstElementChild as HTMLElement;
        if (!innerRow) {
            console.warn('No inner row found in drawer');
            return;
        }
        if (!innerRow.children?.length) {
            return;
        }
        const button = innerRow.children[eraIndex] as HTMLElement;

        const drawerCenter = drawer.offsetWidth / 2;
        const buttonCenter = button.offsetLeft + button.offsetWidth / 2;

        drawer.scrollTo({
            left: buttonCenter - drawerCenter,
            behavior: 'smooth',
        });
    }

    private calculateSidePadding() {
        if (!this.drawerScrollRef) {
            console.warn('No drawer scroll ref found');
            return;
        }
        // This method is called to calculate the side padding of the drawer
        // It sets the left and right padding to the width of the window
        const drawer = this.drawerScrollRef.nativeElement as HTMLElement;
        if (!drawer) {
            console.warn('No drawer found');
            return;
        }
        const innerRow = drawer.firstElementChild as HTMLElement;
        if (!innerRow) {
            console.warn('No inner row found in drawer');
            return;
        }

        if (!innerRow.children?.length) {
            console.warn('No inner row children found in drawer');
            return;
        }

        const screenWidth = window.innerWidth;

        const button = innerRow.children[0] as HTMLElement;
        const buttonWidth = button.getBoundingClientRect().width;
        const totalButtonsWidth = buttonWidth * innerRow.children.length;
        const leftPadding = screenWidth / 2 - buttonWidth / 2;
        const rightPadding = screenWidth / 2 - buttonWidth / 2;
        const drawerWidth = totalButtonsWidth + leftPadding * 2;

        this.drawerWidth = `${drawerWidth}px`;
        this.leftPadding = `${leftPadding}px`;
        this.rightPadding = `${rightPadding}px`;

        this.cdr.detectChanges();
    }
}
