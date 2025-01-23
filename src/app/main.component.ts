import { Component, OnInit } from '@angular/core';
import { AppComponent } from "./app.component";

@Component({
    selector: 'app-main',
    template: `
        <button (click)="show = !show">Toggle!</button>
        @if (show) {
            <app-root />
        }
    `,
    imports: [AppComponent]
})

export class MainComponent {
    show = true;
}
