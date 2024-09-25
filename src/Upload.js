import React, { useState } from 'react';
import './Upload.css'; 

function Upload() {
  const [host, setHost] = useState('');
  const [database, setDatabase] = useState('');
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [numRows, setNumRows] = useState(1); // Default to 10 rows
  const [caseType, setCaseType] = useState('reported'); // Default to "reported"
  const [messages, setMessages] = useState([]);
  const [fileUrl, setFileUrl] = useState('');
  const [loading, setLoading] = useState(false); // State for loading

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessages([]);  // Clear previous messages
  
    try {
      const response = await fetch('https://backend-615425956737.us-central1.run.app/discovery/reported', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          host: host,
          database: database,
          user: user,
          password: password,
          num_rows_to_convert: numRows
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Unknown error occurred');
      }
  
      const data = await response.json();
      
      // Assuming data.messages is an array of success strings, handle them as such
      setMessages(data.messages.map(msg => ({ type: 'success', text: msg })));
      setFileUrl(data.file_url);
  
    } catch (error) {
      setMessages([{ type: 'error', text: error.message }]); // Display error message
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="upload-container">
      <h1>Upload Cases</h1>
      <form onSubmit={handleSubmit} className="upload-form">
        <label>Database Host:</label>
        <input type="text" value={host} onChange={(e) => setHost(e.target.value)} required />

        <label>Database Name:</label>
        <input type="text" value={database} onChange={(e) => setDatabase(e.target.value)} required />

        <label>Username:</label>
        <input type="text" value={user} onChange={(e) => setUser(e.target.value)} required />

        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <label>Number of Rows to Convert:</label>
        <input type="number" value={numRows} onChange={(e) => setNumRows(e.target.value)} required />

        <label>Case Type:</label>
        <select value={caseType} onChange={(e) => setCaseType(e.target.value)}>
          <option value="reported">Reported</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? 'Processing... Please wait' : 'Upload'}
        </button>
      </form>

      {Array.isArray(messages) && messages.length > 0 && (
  <div className="message-container">
    {messages.map((message, index) => (
      <div key={index} className={`message ${message.type === 'error' ? 'error' : 'success'}`}>
        {message.text}
      </div>
    ))}
  </div>
)}

    </div>
  );
}

export default Upload;
