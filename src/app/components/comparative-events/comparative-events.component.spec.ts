import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComparativeEventsComponent } from './comparative-events.component';

describe('ComparativeEventsComponent', () => {
  let component: ComparativeEventsComponent;
  let fixture: ComponentFixture<ComparativeEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComparativeEventsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComparativeEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
