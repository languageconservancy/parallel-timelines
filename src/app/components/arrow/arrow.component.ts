import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-arrow',
    imports: [CommonModule],
    templateUrl: './arrow.component.html',
    styleUrl: './arrow.component.scss'
})
export class ArrowComponent {
    @Input() direction!: 'left' | 'right';
    @Input() size: number = 36;
    @Input() color: string = 'white';
    @Input() outlineColor: string = 'gray';
}
