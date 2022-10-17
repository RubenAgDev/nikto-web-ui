export interface ScanEvent {
  textContent: string,
  cssClass: string,
}

export enum ScannerStatus {
  Stopped,
  Running,
}
