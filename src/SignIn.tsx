// SignIn.tsx
import React, { useState } from 'react';
import userData from './data/userData.json';

interface SignInProps {
  onSignIn: (userId: string) => void;
}

const SignIn: React.FC<SignInProps> = ({ onSignIn }) => {
  const [selectedUser, setSelectedUser] = useState<string>('');

  const handleSignIn = () => {
    if (selectedUser) {
      onSignIn(selectedUser);
    }
  };

  return (
    <div className="signin-container">
      <h2>Sign In</h2>
      <select onChange={(e) => setSelectedUser(e.target.value)} value={selectedUser}>
        <option value="" disabled>
          Select a user to sign in
        </option>
        {userData.users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
      <button onClick={handleSignIn} className="ms-3">Sign In</button>
    </div>
  );
};

export default SignIn;