import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService, SupportedLang } from '../../../core/i18n/i18n.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    TranslatePipe,
  ],
  templateUrl: './app-header.component.html',
  styleUrl: './app-header.component.scss',
})
export class AppHeaderComponent {
  readonly authService = inject(AuthService);
  readonly router = inject(Router);
  readonly i18n = inject(I18nService);

  readonly languages: { code: SupportedLang; flag: string }[] = [
    { code: 'en', flag: '🇬🇧' },
    { code: 'fr', flag: '🇫🇷' },
  ];

  setLang(code: SupportedLang): void {
    this.i18n.setLang(code);
  }
}
