interface Window {
  gtag?: (
    interface: 'event',
    eventName: string,
    params?: {[param: string]: unknown}
  ) => void;
}
