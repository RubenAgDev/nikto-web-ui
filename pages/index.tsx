import type { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';

import styles from '../styles/Home.module.css';

import { ScanEvent, ScannerStatus } from '../models';

import ScannerOptionsForm from '../components/ScannerOptionsForm';
import ScannerOutput from '../components/ScannerOutput';

const Home: NextPage = () => {
  let evtSource: any = null;
  let initialEvents: Array<ScanEvent> = [];

  const [scanOptions, setScanOptions] = useState({});
  const [scannerStatus, setScannerStatus] = useState(ScannerStatus.Stopped);
  const [scanEvents, setScanEvents] = useState(initialEvents);

  const appendOutput = (scanEvent: ScanEvent) => {
    // eventList.scrollTop = eventList.scrollHeight;

    setScanEvents(current => [...current, scanEvent]);
  }

  const closeConnection = () => {
    if (evtSource) evtSource.close();
    setScannerStatus(ScannerStatus.Stopped);
  }

  const handleOptionChange = (event: any) => {
    const name = event.target.name;
    const value = event.target.value;
    setScanOptions(current => ({...current, [name]: value}));
  }

  const handleScanClick = () => {
    if (scannerStatus == ScannerStatus.Running) {
      closeConnection();
      appendOutput({textContent: 'Scanning has stopped!', cssClass: 'text-bg-warning'});
    } else {
      setScannerStatus(ScannerStatus.Running);
      setScanEvents(initialEvents);
      
      let reconnectAttempts = 1;
      const scanOptionsParams = new URLSearchParams(scanOptions);
      const apiUrl = `/api/scan?${scanOptionsParams.toString()}`
      evtSource = new EventSource(apiUrl);
      evtSource.onmessage = (message: any) => {
        const { type, event } = JSON.parse(message.data);
        switch(type) {
          case 'done':
            closeConnection();
            appendOutput({textContent: event, cssClass: 'text-bg-success'});
            break;
          case 'error':
            closeConnection();
            appendOutput({textContent: event, cssClass: 'text-bg-warning'});
            break;
          default:
            // Handles the 'feed' events, sometimes more than one log is sent:
            event.split('+').forEach((item: string) => {
              appendOutput({textContent: item, cssClass: 'text-bg-light'});
            });
        }
      }

      evtSource.onerror = () => {
        if (reconnectAttempts > 3) {
          closeConnection();
          appendOutput({textContent: 'Could not connect to the server!', cssClass: 'bg-danger text-white'});
        } else {
          appendOutput({textContent: `Connection refused (attempt: ${reconnectAttempts})...`, cssClass: 'bg-danger text-white'});
          reconnectAttempts++;
        }
      }
    }
  }

  return <>
    <Head>
      <title>Web Server Scanner</title>
      <meta name='description' content='Web UI with Next.js' />
      <meta name='viewport' content='width=device-width, initial-scale=1'></meta>
      <link rel='icon' href='/favicon.ico' />
    </Head>
    <div className={styles.container}>
      <main className='container-fluid'>
        <h3>
          Let&apos;s scan the web
          <small className='text-muted'> please enter a hostname...</small>
        </h3>
        <ScannerOptionsForm
          scannerStatus={scannerStatus}
          onChangeOption={handleOptionChange}
          onScanClick={handleScanClick} />
        <ScannerOutput scannerStatus={scannerStatus} events={scanEvents} />
      </main>
      <footer className={styles.footer}>
        <a
          href='https://github.com/sullo/nikto'
          target='_blank'
          rel='noopener noreferrer'
        >
          Powered by Nikto
        </a>
      </footer>
    </div>
  </>
}

export default Home;
