import { useState, useEffect } from 'react';

export default function Home() {
  const [companyId, setCompanyId] = useState('');
  const [file, setFile] = useState(null);
  const [vectorizeResponse, setVectorizeResponse] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [chatResponse, setChatResponse] = useState(null);
  const [isClient, setIsClient] = useState(false); // To check if it's running on the client side

  // Check if we are in the browser (client-side rendering)
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleFileChange = async (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);

    if (!companyId || !uploadedFile) {
      alert('Please provide company ID and a text file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadedFile);
    formData.append('companyId', companyId);
    formData.append('modelName', 'bge-m3');

    try {
      const response = await fetch('/api/vectorize', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to vectorize file.');
      }

      const data = await response.json();
      setVectorizeResponse(data);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('There was an error uploading the file. Please try again.');
    }
  };

  const handleChat = async () => {
    if (!chatInput) {
      alert('Please enter a question.');
      return;
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId,
          model: 'llama3.1',
          chatInput,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get chat response.');
      }

      const data = await response.json();

      // Extract and clean the 'response' part
      const cleanedResponse = data.response.replace(/\n/g, '<br>');
      setChatResponse(cleanedResponse);
    } catch (error) {
      console.error('Error during chat:', error);
      alert('There was an error with your chat request. Please try again.');
    }
  };

  if (!isClient) {
    return null; // Avoid rendering on the server side
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Chat with Text File</h1>

      <div style={styles.formGroup}>
        <input
          style={styles.input}
          type="text"
          placeholder="Enter your Company ID"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
        />

        <input type="file" style={styles.fileInput} onChange={handleFileChange} />
      </div>

      {file && <p style={styles.fileName}>{file.name}</p>}

      {vectorizeResponse && (
        <pre style={styles.responseBox}>{JSON.stringify(vectorizeResponse, null, 2)}</pre>
      )}

      <div style={styles.formGroup}>
        <input
          style={styles.input}
          type="text"
          placeholder="Ask a question"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
        />
        <button style={styles.button} onClick={handleChat}>
          Ask
        </button>
      </div>

      {chatResponse && (
        <div
          style={styles.responseBox}
          dangerouslySetInnerHTML={{ __html: chatResponse }}
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    margin: '0 auto',
    padding: '2rem',
    maxWidth: '800px',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    textAlign: 'center',
    color: '#333',
  },
  formGroup: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  input: {
    flex: 1,
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    marginRight: '0.5rem',
  },
  fileInput: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  button: {
    padding: '0.5rem 1rem',
    fontSize: '1rem',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  responseBox: {
    backgroundColor: '#f9f9f9',
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '1rem',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    fontSize: '0.9rem',
    marginTop: '1rem',
  },
  fileName: {
    fontSize: '0.9rem',
    fontStyle: 'italic',
    color: '#555',
  },
};
