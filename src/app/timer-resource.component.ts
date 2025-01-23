import {
  Component,
  computed,
  resource,
  ResourceRef,
  ResourceStatus,
  signal,
} from '@angular/core';

export type StreamItem =
  | {
      value: number;
    }
  | {
      error: unknown;
    };

export function timerResource(
  timeout: number,
  startValue: () => number
): ResourceRef<number | undefined> {
  const request = computed(() => ({
    startValue: startValue(),
  }));

  const result = resource({
    request: request,
    stream: async (params) => {
      let counter = params.request.startValue;

      const resultSignal = signal<StreamItem>({
        value: params.request.startValue,
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
