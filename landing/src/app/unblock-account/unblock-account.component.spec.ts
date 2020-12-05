import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnblockAccountComponent } from './unblock-account.component';

describe('UnblockAccountComponent', () => {
  let component: UnblockAccountComponent;
  let fixture: ComponentFixture<UnblockAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnblockAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnblockAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
