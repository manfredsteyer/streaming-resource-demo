import { Component, computed, ResourceRef, ResourceStatus, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { interval, map, startWith, switchMap, tap, throwError } from 'rxjs';

export function timerResource(
  timeout: number,
  startValue: () => number
): ResourceRef<number | undefined> {

  const request = computed(() => ({
    startValue: startValue(),
  }));

  return rxResource({
    request: request,
    loader: (params) => {
      const startValue = params.request.startValue;
      return interval(timeout).pipe(
        map((v) => v + startValue + 1),
        startWith(startValue),
        tap((v) => console.log('counter', v)),
        switchMap((value) => {
          if (value === 7 || value === 13) {
            return throwError(() => 'bad luck');
          }
          return [value];
        })
      );
    },
  });
}

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './timer-rx-resource.component.html',
})
export class TimerRxResourceComponent {
  ResourceStatus = ResourceStatus;

  startValue = signal(0);

  request = computed(() => ({
    startValue: this.startValue(),
  }));

  timerResource = timerResource(1000, this.startValue)

  forward(): void {
    this.startValue.update((v) => nextSegment(v));
  }
}

function nextSegment(currentValue: number): number {
  return Math.floor(currentValue / 100) * 100 + 100;
}
