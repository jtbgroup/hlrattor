import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppFooterComponent } from './footer/app-footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AppFooterComponent],
  template: `
    <router-outlet />
    <app-footer />
  `
})
export class AppComponent {}
