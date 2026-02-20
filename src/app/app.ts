import { Component } from '@angular/core';
import { CmskUiComponent } from './components/cmsk-ui/cmsk-ui.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CmskUiComponent],
  template: `<app-cmsk-ui></app-cmsk-ui>`,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
  `]
})
export class App { }
