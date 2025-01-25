import { Component, ResourceStatus, signal } from '@angular/core';
import { timerResource } from './timer-rx-resource.component';

@Component({
  selector: 'app-timer-resource',
  imports: [],
  templateUrl: './timer-resource.component.html',
})
export class TimerResourceComponent {
  ResourceStatus = ResourceStatus;

  startValue = signal(0);
  timer = timerResource(1000, this.startValue);

  forward(): void {
    this.startValue.update((v) => nextSegment(v));
  }
}

function nextSegment(currentValue: number): number {
  return Math.floor(currentValue / 100) * 100 + 100;
}
