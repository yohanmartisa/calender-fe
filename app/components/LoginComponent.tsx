import React, { useState } from 'react';
import './LoginComponent.css';

interface LoginComponentProps {
  onLoginSuccess: (token: string) => void;
}

const LoginComponent: React.FC<LoginComponentProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.access_token;
        localStorage.setItem('token', token);
        onLoginSuccess(token);
        setShowModal(false);
      }
    } catch (error) {
      console.log(error)
    }
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };
  return (
    <div>
      <button onClick={() => setShowModal(true)}>Login</button>
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowModal(false)}>&times;</span>
            <input className="login-input"type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
            <input className="login-input"type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
            <button className="button-input" onClick={handleLogin}>Login</button>
          </div>
        </div>
      )}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default LoginComponent;