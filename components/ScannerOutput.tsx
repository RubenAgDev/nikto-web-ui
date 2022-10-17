import { ScanEvent, ScannerStatus } from "../models";

interface ScannerOutputProps {
  scannerStatus: ScannerStatus,
  events: Array<ScanEvent>,
}

const ScannerOutput = ({events, scannerStatus}: ScannerOutputProps) => {
  return (
    <div className="card">
      <div className="card-body">
        <div className="card-text" id="event-list" style={{height: "500px", overflowY: "scroll"}}>
          { events.map((item, idx) => (
            <p className={`${item.cssClass} p-2 mb-2 fw-lighter`} key={`scan-event-${idx}`}>
              {item.textContent}
            </p>
          ))}
        </div>
        <div className="card-text">
          { scannerStatus == ScannerStatus.Running && 
            <div className="spinner-grow scan-status-indicator text-secondary" role="status">
              <span className="visually-hidden">Scanning...</span>
            </div>
          }
        </div>
      </div>
    </div>
  )
};

export default ScannerOutput;
