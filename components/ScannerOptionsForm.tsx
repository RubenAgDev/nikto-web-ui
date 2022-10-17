import type { ChangeEventHandler, MouseEventHandler } from "react";
import { ScannerStatus } from "../models";

interface ScannerOptionsFormProps {
  scannerStatus: ScannerStatus,
  onChangeHostname: ChangeEventHandler,
  onScanClick: MouseEventHandler,
}

const ScannerOptionsForm = ({scannerStatus, onChangeHostname, onScanClick}: ScannerOptionsFormProps) => {
  return (
    <div className="row align-items-center">
      <div className="col">
        <label htmlFor="host-input" className="visually-hidden">Enter the hostname to scan:</label>
        <input type="text" className="form-control" id="host-input" placeholder="https://example.com" onChange={onChangeHostname} />
      </div>
      <div className="col p-3">
        <button type="button" className="btn btn-primary" id="scan-button" onClick={onScanClick}>
          { scannerStatus == ScannerStatus.Running &&
            <span className="spinner-border spinner-border-sm scan-status-indicator" role="status" aria-hidden="true"></span>
          }
          <span id="scan-button-text">{scannerStatus == ScannerStatus.Running ? "Stop" : "Start"}</span>
        </button>
      </div>
    </div>
  );
};

export default ScannerOptionsForm;
