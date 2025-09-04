import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function ManifestPDFViewer() {
  const { id } = useParams();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState(null);

  //const API_URL = 'http://localhost:4000/api'; // laptop
  //const API_URL = 'http://192.168.18.232:4000/api'; // phone
  const API_URL = `${process.env.REACT_APP_API_URL}/api`;

  useEffect(() => {
    const fetchPDF = async () => {
      const token = localStorage.getItem('token');

      try {
        const res = await fetch(`${API_URL}/manifests/${id}/pdf`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch PDF');

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (err) {
        console.error(err);
        setError('Failed to load PDF. Please try again.');
      }
    };

    fetchPDF();

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!pdfUrl) {
    return <div>Loading PDF...</div>;
  }

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <object
        data={pdfUrl}
        type="application/pdf"
        width="100%"
        height="100%"
      >
        <p>
          PDF cannot be displayed.{' '}
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
            Click here to download it.
          </a>
        </p>
      </object>
    </div>
  );
}