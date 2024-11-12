import React, { useState } from 'react';
import './App.css';
import SignIn from './SignIn';
import MainPage from './MainPage';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  const handleSignIn = (userId: string) => {
    setCurrentUserId(userId);
    setIsAuthenticated(true);
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setCurrentUserId('');
  };

  return (
    <div className="App">
      {isAuthenticated ? (
        <MainPage userId={currentUserId} onSignOut={handleSignOut} />
      ) : (
        <SignIn onSignIn={handleSignIn} />
      )}
    </div>
  );
};

export default App;