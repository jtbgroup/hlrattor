import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppHeaderComponent } from '../header/app-header.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, AppHeaderComponent],
  template: `
    <app-header />
    <main class="shell-content">
      <router-outlet />
    </main>
  `,
  styles: [`
    .shell-content {
      padding: 32px;
    }
  `]
})
export class AppShellComponent {}
