import { useState, useEffect } from 'react';
import { ScanEvent } from '../models';

type ScannerOutputProps = {
  isScanning: boolean;
  events: Array<ScanEvent>;
  outputPanelRef: any;
  reportContent?: string;
}

const ScannerOutput = ({events, isScanning, outputPanelRef, reportContent}: ScannerOutputProps) => {
  const [showOutputPanel, setShowOutputPanel] = useState(true);
  const [downloadUrl, setDownloadUrl] = useState('');

  useEffect(() => {
    if (reportContent) {
      const file = new Blob([reportContent], {type: 'application/json'});
      setDownloadUrl(URL.createObjectURL(file));
    }
  }, [reportContent]);

  const toggleOutputPanel = () => {
    setShowOutputPanel(current => !current);
  }

  return <>
    <div style={{textAlign: 'right'}}>
      <a className='btn btn-link' onClick={toggleOutputPanel}>{ showOutputPanel ? "Hide Panel" : "Show Panel" }</a>
      <a className={`btn btn-link ${!downloadUrl && 'disabled'}`} href={downloadUrl} download>Download Report</a>
    </div>
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
  </>
};

export default ScannerOutput;
