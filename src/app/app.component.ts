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
  startValue = signal(0);
  timer = timerResource(1000, this.startValue);
  ResourceStatus = ResourceStatus;

  forward(): void {
    this.startValue.update(v => nextSegment(v));
  }
}

function nextSegment(v: number): number {
  return Math.floor(v / 100) * 100 + 100;
}
