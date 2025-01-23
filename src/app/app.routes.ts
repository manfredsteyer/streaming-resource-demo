import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { TimerResourceComponent } from './timer-resource.component';
import { TimerRxResourceComponent } from './timer-rx-resource.component';

export const routes: Routes = [
    { path: '', component: HomeComponent, pathMatch: 'full'},
    { path: 'resource', component: TimerResourceComponent },
    { path: 'rx-resource', component: TimerRxResourceComponent },
];
