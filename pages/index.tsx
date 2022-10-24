import type { NextPage } from 'next';
import Head from 'next/head';
import { useState, useRef } from 'react';

import styles from '../styles/Home.module.css';

import { ScanEvent, ScanEventType } from '../models';

import ScannerOptionsForm from '../components/ScannerOptionsForm';
import ScannerOutput from '../components/ScannerOutput';

const Home: NextPage = () => {
  let evtSource: any = null;
  let initialEvents: Array<ScanEvent> = [];
  const outputPanelRef: any = useRef();
  const [scanOptions, setScanOptions] = useState({});
  const [isScanning, setIsScanning] = useState(false);
  const [scanEvents, setScanEvents] = useState(initialEvents);

  const appendToEventList = (scanEvent: ScanEvent) => {
    if (scanEvent.content) {
      setScanEvents(current => [...current, scanEvent]);
      outputPanelRef.current.scrollTop = outputPanelRef.current.scrollHeight;
    }
  }

  const processOutput = (output: string) => {
    console.log(output);
  }

  const closeConnection = () => {
    if (evtSource) evtSource.close();
    setIsScanning(false);
  }

  const handleOptionChange = (event: any) => {
    const name = event.target.name;
    let value = event.target.value;
    if (event.target.type === 'select-multiple') {
      value = Array.from(event.target.selectedOptions, (option: any) => option.value);
    }
    setScanOptions(current => ({...current, [name]: value}));
  }

  const handleScanClick = () => {
    if (isScanning) {
      closeConnection();
      appendToEventList({content: 'Scanning has stopped.', type: ScanEventType.WARNING});
    } else {
      setIsScanning(true);
      setScanEvents(initialEvents);
      
      let reconnectAttempts = 1;
      const scanOptionsParams = new URLSearchParams(scanOptions);
      const apiUrl = `/api/scan?${scanOptionsParams.toString()}`;
      evtSource = new EventSource(apiUrl);
      evtSource.onmessage = (message: any) => {
        const { type, content, output } = JSON.parse(message.data);
        switch(type) {
          case 'done':
            closeConnection();
            appendToEventList({content, type: ScanEventType.SUCCESS});
            processOutput(output);
            break;
          case 'error':
            closeConnection();
            appendToEventList({content, type: ScanEventType.WARNING});
            break;
          default:
            // Handles the 'feed' events, sometimes more than one log is sent:
            content.split('+').forEach((item: string) => {
              appendToEventList({content: item, type: ScanEventType.INFO});
            });
        }
      }

      evtSource.onerror = () => {
        if (reconnectAttempts > 3) {
          closeConnection();
          appendToEventList({content: 'Could not connect to the server.', type: ScanEventType.DANGER});
        } else {
          appendToEventList({content: `Connection refused (attempt: ${reconnectAttempts})...`, type: ScanEventType.DANGER});
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
          isScanning={isScanning}
          onChangeOption={handleOptionChange}
          onScanClick={handleScanClick} />
        <ScannerOutput isScanning={isScanning} events={scanEvents} outputPanelRef={outputPanelRef} />
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
