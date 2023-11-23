import {
  Component,
  HostBinding,
} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'SitecWeb';

  private isDark = false;

  @HostBinding('class')
  get themeMode() {
    return this.isDark ? 'darkMode' : 'lightMode';
  }

  switchMode(isDarkMode: boolean) {
    this.isDark = isDarkMode;
  }
}
