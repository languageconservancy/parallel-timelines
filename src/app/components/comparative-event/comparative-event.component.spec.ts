import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComparativeEventComponent } from './comparative-event.component';

describe('ComparativeEventComponent', () => {
  let component: ComparativeEventComponent;
  let fixture: ComponentFixture<ComparativeEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComparativeEventComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComparativeEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
