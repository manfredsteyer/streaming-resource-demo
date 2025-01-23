import {
  Component,
  computed,
  DestroyRef,
  inject,
  resource,
  ResourceRef,
  ResourceStatus,
  Signal,
  signal,
} from '@angular/core';

import { rxResource } from '@angular/core/rxjs-interop';
import { interval, map, startWith, switchMap, tap, throwError, timer } from 'rxjs';

export type StreamItem = {
  value: number;
}
| {
  error: unknown;
};

export function timerResource(
  timeout: number,
  startValue: Signal<number>,
): ResourceRef<number | undefined> {

  const destroyRef = inject(DestroyRef);
  const resultSignal = signal<StreamItem>({ value: 0 });
  const request = computed(() => ({
    startValue: startValue()
  }));

  let ref: unknown = null;

  const result = resource({
    request: request,
    stream: async (params) => {
      let counter = params.request.startValue;

      //
      // This converts the default merge map sematics 
      // into switch map semantics
      //
      if (ref) {
        clearInterval(ref as number);
      }

      resultSignal.set({ value: params.request.startValue });

      ref = setInterval(() => {
        counter++;
        console.log('tick', counter);

        if (counter === 7 || counter === 13) {
          resultSignal.set({ error: 'bad luck!' });
        } else {
          resultSignal.set({ value: counter });
        }
      }, timeout);
      return resultSignal;
    },
  });

  //
  // Is there currently a better way for
  // closing the unterlying source?
  //
  destroyRef.onDestroy(() => {
    console.log('onDestroy');
    clearInterval(ref as number);
  });

  return result;
}

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  ResourceStatus = ResourceStatus;

  startValue = signal(0);

  request = computed(() => ({
    startValue: this.startValue()
  }));

  //
  // All rxResources are now streaming resources.
  // If we want the former behavior, we need to call
  // takeFirst in the pipe
  //

  //
  // The streaming resource always has switch map sematics
  // when the loader returns a new stream
  //
  timerResource = rxResource({
    request: this.request,
    loader: (params) => {
      const startValue = params.request.startValue;
      return interval(1000).pipe(
        map(v => v + startValue + 1), 
        startWith(startValue),
        tap(x => console.log('counter', x)),
        switchMap((value) => {
          if (value === 7 || value === 13) {
            return throwError(() => 'bad luck');
          }
          return [value];
        })
      );
    }
  });

  //
  // IMHO, this is where the mindset of RxJS
  // and the resource don't go together:
  // Other than tradition resources, rxResources
  // cannot be put into error state but
  // still go on. 
  //
  // If I use catchError, the rxResource never
  // sees the error.
  //
  // Do I miss something here?
  //

  forward(): void {
    this.startValue.update(v => nextSegment(v));
  }
}

function nextSegment(v: number): number {
  return Math.floor(v / 100) * 100 + 100;
}
