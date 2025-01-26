export type StreamItem<T> =
  | {
      value: T;
    }
  | {
      error: unknown;
    };