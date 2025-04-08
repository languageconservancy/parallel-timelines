import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaleComponent } from './tale.component';

describe('TaleComponent', () => {
  let component: TaleComponent;
  let fixture: ComponentFixture<TaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
