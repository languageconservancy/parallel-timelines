import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomDrawerVisibleComponent } from './bottom-drawer-visible.component';

describe('BottomNavComponent', () => {
  let component: BottomDrawerVisibleComponent;
  let fixture: ComponentFixture<BottomDrawerVisibleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomDrawerVisibleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BottomDrawerVisibleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
