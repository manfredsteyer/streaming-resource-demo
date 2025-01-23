import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `
    <nav class="menu">
      <ul>
        <li><a routerLink="/">Home</a></li>
        <li><a routerLink="/resource">Streaming Resource</a></li>
        <li><a routerLink="/rx-resource">Streaming RxResource</a></li>
      </ul>
    </nav>

    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  imports: [RouterLink, RouterOutlet],
})
export class AppComponent {}
