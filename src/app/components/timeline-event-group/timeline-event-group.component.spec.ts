import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineEventGroupComponent } from './timeline-event-group.component';

describe('TimelineEventGroupComponent', () => {
  let component: TimelineEventGroupComponent;
  let fixture: ComponentFixture<TimelineEventGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimelineEventGroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimelineEventGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
