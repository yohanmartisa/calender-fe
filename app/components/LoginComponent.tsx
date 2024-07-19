  import React, { useState } from 'react';
  import './LoginComponent.css';

  interface LoginComponentProps {
    onLoginSuccess: (token?: string) => void;
    token: string | null;
  }

  const LoginComponent: React.FC<LoginComponentProps> = ({ onLoginSuccess, token }) => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [showModalLogin, setShowModalLogin] = useState(false);
    const [showModalRegister, setShowModalRegister] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleLogin = async () => {
      try {
        if (!username || !password) {
          alert('Your must fill in the username and password.');
          return;
        }

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
          setShowModalLogin(false);
        }
      } catch (error) {
        console.log(error)
      }
    };

    const handleRegister = async () => {
      try {
        if (showModalRegister && (!username || !password || !name || !email)) {
          alert('You must fill in all the fields.');
          return;
        }
        // Add a check to compare password and confirm password
        if (showModalRegister && password !== confirmPassword) {
          alert('Password and Confirm Password do not match.');
          return;
        }

        const response = await fetch('http://localhost:3001/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password, name, mail: email }),
        });
        if (response.ok) {
          onLoginSuccess();
          setShowModalRegister(false);
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
        {!token ? 
          <><button className="btn-primary" onClick={() => setShowModalLogin(true)}>Login</button>
          <button className="btn-secondary" onClick={() => setShowModalRegister(true)}>Register</button></>
        : (
          <button className="btn-primary" onClick={handleLogout}>Logout</button>
        )}
        
        {showModalLogin && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={() => setShowModalLogin(false)}>&times;</span>
              <input className="login-input"type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
              <div style={{ position: 'relative' }}>
                <input className="login-input" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
                <button className="show-password-button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Hide' : 'Show'}</button>
              </div>
              <button className="button-input" onClick={handleLogin}>Login</button>
            </div>
          </div>
        )}
        {showModalRegister && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={() => setShowModalRegister(false)}>&times;</span>
              <input className="login-input"type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required/>
              <div style={{ position: 'relative' }}>
                <input className="login-input" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required/>
                <button onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Hide' : 'Show'}</button>
              </div>
              <div style={{ position: 'relative' }}>
                <input className="login-input" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" required/>
                <button onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? 'Hide' : 'Show'}</button>
              </div>
              <input className="login-input"type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="name" required/>
              <input className="login-input" type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required/>
              <button className="button-input" onClick={handleRegister}>Register</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  export default LoginComponent;