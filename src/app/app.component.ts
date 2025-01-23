import {
  Component,
  computed,
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

  const request = computed(() => ({
    startValue: startValue()
  }));

  const result = resource({
    request: request,
    stream: async (params) => {
      let counter = params.request.startValue;

      const resultSignal = signal<StreamItem>({ 
        value: params.request.startValue 
      });

      const ref = setInterval(() => {
        counter++;
        console.log('tick', counter);

        if (counter === 7 || counter === 13) {
          resultSignal.set({ error: 'bad luck!' });
        } else {
          resultSignal.set({ value: counter });
        }
      }, timeout);

      params.abortSignal.addEventListener('abort', () => {
        console.log('clean up!');
        clearInterval(ref);
      });

      return resultSignal;
    },
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
