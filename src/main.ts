import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { MainComponent } from './app/main.component';

bootstrapApplication(MainComponent, appConfig)
  .catch((err) => console.error(err));
