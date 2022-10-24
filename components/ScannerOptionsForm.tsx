import type { ChangeEventHandler, MouseEventHandler } from 'react';

interface ScannerOptionsFormProps {
  isScanning: boolean,
  onChangeOption: ChangeEventHandler,
  onScanClick: MouseEventHandler,
}

const ScannerOptionsForm = ({isScanning, onChangeOption, onScanClick}: ScannerOptionsFormProps) => {
  return <>
    <div className='mb-3'>
      <label htmlFor='host-input' className='visually-hidden'>Enter the hostname to scan:</label>
      <input id='host-input' type='text' className='form-control' name='host' placeholder='https://example.com' onChange={onChangeOption} />
    </div>
    <div className='mb-3'>
      <p>
        <a data-bs-toggle='collapse' href='#more-options' role='button' aria-expanded='false' aria-controls='more-options'>
          Click here to set more options...
        </a>
      </p>
      <div className='collapse' id='more-options'>
        <div className='form-floating mb-3'>  
          <input id='static-cookie-input' type='text' className='form-control' name='staticCookie' onChange={onChangeOption} placeholder='"name=value";"something=nothing";' />
          <label htmlFor='static-cookie-input'>Static cookie:</label>
        </div>
        <div className='mb-3'>
          <label htmlFor='scan-tunning-input'>Scan tunning:</label>
          <select id='scan-tunning-input' className="form-select form-select-sm" multiple aria-label="scan tunning options" name='tunning' onChange={onChangeOption}>
            <option value="0">0 File Upload</option>
            <option value="1">1 Interesting File / Seen in logs</option>
            <option value="2">2 Misconfiguration / Default File</option>
            <option value="3">3 Information Disclosure</option>
            <option value="4">4 Injection (XSS/Script/HTML)</option>
            <option value="5">5 Remote File Retrieval - Inside Web Root</option>
            <option value="6">6 Denial of Service</option>
            <option value="7">7 Remote File Retrieval - Server Wide</option>
            <option value="8">8 Command Execution / Remote Shell</option>
            <option value="9">9 SQL Injection</option>
            <option value="a">a Authentication Bypass</option>
            <option value="b">b Software Identification</option>
            <option value="c">c Remote Source Inclusion</option>
            <option value="d">d WebService</option>
            <option value="e">e Administrative Console</option>
            <option value="x">x Reverse Tuning Options (i.e., include all except specified)</option>
          </select>
        </div>
      </div>
    </div>
    <div className='mb-3'>
      <button type='button' className='btn btn-primary' onClick={onScanClick}>
        { isScanning ?
          <>
            <span className='spinner-border spinner-border-sm scan-status-indicator' role='status' aria-hidden='true'></span>
            <span>&nbsp;&nbsp;Stop Scanning</span>
          </>
          : <span>Start Scanning</span>
        }
      </button>
    </div>
  </>;
};

export default ScannerOptionsForm;
