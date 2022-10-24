import { useState } from 'react';
import { ScanEvent } from '../models';

interface ScannerOutputProps {
  isScanning: boolean,
  events: Array<ScanEvent>,
  outputPanelRef: any,
}

const ScannerOutput = ({events, isScanning, outputPanelRef}: ScannerOutputProps) => {
  const [showOutputPanel, setShowOutputPanel] = useState(true);

  const toggleOutputPanel = () => {
    setShowOutputPanel(current => !current);
  }

  return <>
    { showOutputPanel && <div className='card' id='output-panel' ref={outputPanelRef} style={{height: '600px', overflowY: 'scroll'}}>
      <div className='card-body'>
        <div className='card-text'>
          { events.map((item, idx) => (
            <p className={`text-bg-${item.type} p-2 mb-2 fw-lighter`} key={`scan-event-${idx}`}>
              {item.content}
            </p>
          ))}
        </div>
        <div className='card-text'>
          { isScanning && 
            <div className='spinner-grow scan-status-indicator text-secondary' role='status'>
              <span className='visually-hidden'>Scanning...</span>
            </div>
          }
        </div>
      </div>
    </div> }
    <div style={{textAlign: 'right'}}>
      <span className='btn btn-link' role='button' onClick={toggleOutputPanel}>
        { showOutputPanel ? "hide output panel" : "show output panel" }
      </span>
    </div>
  </>
};

export default ScannerOutput;
