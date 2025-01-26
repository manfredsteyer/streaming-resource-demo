import { computed, resource, ResourceRef, signal } from '@angular/core';
import { StreamItem } from './utils/stream-item';

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

      const resultSignal = signal<StreamItem<number>>({
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
