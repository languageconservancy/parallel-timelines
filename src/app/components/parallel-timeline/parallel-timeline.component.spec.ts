import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParallelTimelineComponent } from './parallel-timeline.component';

describe('TaleCustomComponent', () => {
  let component: ParallelTimelineComponent;
  let fixture: ComponentFixture<ParallelTimelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParallelTimelineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParallelTimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
