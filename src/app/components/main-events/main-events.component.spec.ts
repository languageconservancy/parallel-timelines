import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainEventsComponent } from './main-events.component';

describe('MainEventsComponent', () => {
  let component: MainEventsComponent;
  let fixture: ComponentFixture<MainEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainEventsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
