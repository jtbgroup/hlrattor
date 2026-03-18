import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18nService } from './i18n.service';

/**
 * Usage in templates: {{ 'login.signIn' | translate }}
 */
@Pipe({
  name: 'translate',
  standalone: true,
  pure: false, // must be impure so it reacts to language changes
})
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(I18nService);

  transform(path: string): string {
    return this.i18n.translate(path);
  }
}
