import { Component } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="app-footer">
      <span class="version">v{{ version }}</span>
    </footer>
  `,
  styles: [`
    .app-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 0 16px;
      background: rgba(0, 0, 0, 0.04);
      border-top: 1px solid rgba(0, 0, 0, 0.08);
      z-index: 10;
    }

    .version {
      font-size: 11px;
      color: rgba(0, 0, 0, 0.38);
      font-family: monospace;
      letter-spacing: 0.03em;
      user-select: none;
    }
  `]
})
export class AppFooterComponent {
  readonly version = environment.appVersion;
}
