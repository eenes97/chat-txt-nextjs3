import { useState } from 'react';

export default function Home() {
  const [companyId, setCompanyId] = useState('');
  const [file, setFile] = useState(null);
  const [vectorizeResponse, setVectorizeResponse] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [chatResponse, setChatResponse] = useState(null);

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

    const response = await fetch('/api/vectorize', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    setVectorizeResponse(data);
  };

  const handleChat = async () => {
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

    const data = await response.json();
    
    // Extract and clean the 'response' part
    const cleanedResponse = data.response.replace(/\n/g, '<br>');
    setChatResponse(cleanedResponse);
  };

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

      {/* Show Only the Cleaned Response */}
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
