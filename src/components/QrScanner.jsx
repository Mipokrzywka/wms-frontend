import { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QrScanner = ({ onScanSuccess }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true,
    });
    const handleSuccess = (decodedText) => {
      scanner.clear().then(() => {
        onScanSuccess(decodedText); 
      }).catch(err => console.error("Błąd przy zamykaniu skanera", err));
    };

    const handleError = (err) => {
    };

    scanner.render(handleSuccess, handleError);

    return () => {
      scanner.clear().catch(err => console.error("Błąd czyszczenia skanera", err));
    };
  }, [onScanSuccess]);

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '10px' }}>
      <div id="reader"></div>
    </div>
  );
};

export default QrScanner;