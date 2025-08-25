import React, { useRef, useState } from "react";

import { BarcodeFormat, BarcodeScanner } from "react-barcode-scanner";
import "react-barcode-scanner/polyfill";

// This component uses the browser's getUserMedia API to access the camera.
// For real barcode scanning, consider using a library like 'jsqr' or 'quagga', but here we'll stub the scan and lookup.
type LookupResult = {
  upc: string;
  name: string;
};

const UPCScanner: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanning, setScanning] = useState(false);
  const [upc, setUPC] = useState<string | null>(null);
  const [lookupResult, setLookupResult] = useState<LookupResult>();

  // Start camera
  const startScan = async () => {
    setScanning(true);
    setUPC(null);
    setLookupResult(undefined);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      alert("Camera access denied or not available.");
      setScanning(false);
    }
  };

  // Stop camera
  const stopScan = () => {
    setScanning(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Stub: Simulate UPC lookup
  const stubLookup = async (code: string) => {
    stopScan();
    const response = await fetch(
      `https://api.upcitemdb.com/prod/trial/lookup?upc=${code}`
    );
    const data = await response.json();
    if (data.items.length > 0) {
      setUPC(code);
      setLookupResult({
        upc: code,
        name: data.items[0].title,
      });
    } else {
      setLookupResult({
        upc: code,
        name: "Unknown Product",
      });
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>UPC Scanner</h2>
      {!scanning && <button onClick={startScan}>Start Scanning</button>}
      {scanning && (
        <BarcodeScanner
          options={{
            formats: [BarcodeFormat.UPC_A],
          }}
          onCapture={(barcode) => {
            console.log(barcode);
            stubLookup(barcode[0].rawValue);
          }}
        />
      )}
      {upc && (
        <div>
          <h3>Scanned UPC: {upc}</h3>
        </div>
      )}
      {lookupResult && (
        <div style={{ marginTop: 16 }}>
          <h4>Stubbed Lookup Result</h4>
          <pre>{JSON.stringify(lookupResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default UPCScanner;
