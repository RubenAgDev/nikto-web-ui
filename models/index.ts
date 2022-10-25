export enum ScanEventType {
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  INFO = 'light',
  DANGER = 'danger',
}

export interface ScanEvent {
  content: string,
  type: ScanEventType,
}
