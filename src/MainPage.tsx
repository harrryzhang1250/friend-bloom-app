import React, { useState, useEffect, useCallback } from 'react';
import userData from './data/userData.json';

interface User {
  id: string;
  name: string;
  connections: string[];
}

interface MainPageProps {
  userId: string;
  onSignOut: () => void;
}

const MainPage: React.FC<MainPageProps> = ({ userId, onSignOut }) => {
  const [users, setUsers] = useState<User[]>(userData.users);
  const [user, setUser] = useState<User | null>(null);
  const [connections, setConnections] = useState<string[]>([]);
  const [availableConnections, setAvailableConnections] = useState<User[]>([]);
  const [selectedAddConnection, setSelectedAddConnection] = useState<string>('');
  const [selectedRemoveConnection, setSelectedRemoveConnection] = useState<string>('');
  const [selectedRouteConnection, setSelectedRouteConnection] = useState<string>('');
  const [levelOneConnections, setLevelOneConnections] = useState<string[]>([]);
  const [levelTwoConnections, setLevelTwoConnections] = useState<string[]>([]);
  const [levelThreeConnections, setLevelThreeConnections] = useState<string[]>([]);
  const [levelFourConnections, setLevelFourConnections] = useState<string[]>([]);
  const [disconnectedUsers, setDisconnectedUsers] = useState<string[]>([]);
  const [shortestRoutes, setShortestRoutes] = useState<string[][]>([]);

  useEffect(() => {
    // Load user data from state based on logged in user
    const currentUser = users.find((u) => u.id === userId) as User;
    setUser({ ...currentUser, connections: [...connections] });
    setConnections(currentUser.connections);
    setAvailableConnections(
      users.filter((u) => !currentUser.connections.includes(u.id) && u.id !== currentUser.id)
    );
    setSelectedAddConnection("")
    setSelectedRemoveConnection("")
    setSelectedRouteConnection("")
    setShortestRoutes([])
  }, [userId, users, connections]);

  const rearrangeMap = useCallback((startUserId: string) => {
    // BFS to determine the levels of connections
    const queue: [string, number][] = [[startUserId, 0]];
    const visited: Set<string> = new Set();
    visited.add(startUserId);

    const levelOne: string[] = [];
    const levelTwo: string[] = [];
    const levelThree: string[] = [];
    const levelFour: string[] = [];

    while (queue.length > 0) {
      const [currentUserId, level] = queue.shift()!;
      const currentUser = users.find((u) => u.id === currentUserId) as User;

      currentUser.connections.forEach((connectionId) => {
        if (!visited.has(connectionId)) {
          visited.add(connectionId);
          queue.push([connectionId, level + 1]);

          if (level + 1 === 1) {
            levelOne.push(connectionId);
          } else if (level + 1 === 2) {
            levelTwo.push(connectionId);
          } else if (level + 1 === 3) {
            levelThree.push(connectionId);
          } else if (level + 1 === 4) {
            levelFour.push(connectionId);
          }
        }
      });
    }

    setLevelOneConnections(levelOne);
    setLevelTwoConnections(levelTwo);
    setLevelThreeConnections(levelThree);
    setLevelFourConnections(levelFour);
    setDisconnectedUsers(users.filter((u) =>
      !levelOne.includes(u.id)
      && !levelTwo.includes(u.id)
      && !levelThree.includes(u.id)
      && !levelFour.includes(u.id)
      && u.id !== startUserId)
      .map((u) => u.id));
  }, [users]);

  useEffect(() => {
    if (user) {
      rearrangeMap(user.id);
    }
  }, [user, connections, rearrangeMap]);

  const handleAddConnection = (selectedUser: string) => {
    // Update connections
    setConnections((prevConnections) => {
      const newConnections = [...prevConnections, selectedUser];
      setUser((prevUser) => prevUser ? { ...prevUser, connections: newConnections } : null);
      setUsers((prevUsers) => prevUsers.map(u => u.id === userId ? { ...u, connections: newConnections } : u));
      return newConnections;
    });

    // Remove from available connections
    setAvailableConnections((prevAvailable) => prevAvailable.filter((u) => u.id !== selectedUser));
  };

  const handleRemoveConnection = (selectedUser: string) => {
    // Update connections
    setConnections((prevConnections) => {
      const newConnections = prevConnections.filter((u) => u !== selectedUser);
      setUser((prevUser) => prevUser ? { ...prevUser, connections: newConnections } : null);
      setUsers((prevUsers) => prevUsers.map(u => u.id === userId ? { ...u, connections: newConnections } : u));
      return newConnections;
    });

    // Add to available connections
    setAvailableConnections((prevAvailable) => {
      const userToAddBack = users.find((u) => u.id === selectedUser);
      if (userToAddBack) {
        return [...prevAvailable, userToAddBack];
      }
      return prevAvailable;
    });
  };

  // Using backtracking
  const findRoutes = (targetUserId: string) => {
    const routes: string[][] = [];
    const path: string[] = [userId];
    const targetLevel =
      levelOneConnections.includes(targetUserId) ? 1 :
        levelTwoConnections.includes(targetUserId) ? 2 :
          levelThreeConnections.includes(targetUserId) ? 3 :
            levelFourConnections.includes(targetUserId) ? 4 : 0;

    const backtrack = (currentUserId: string, level: number) => {
      if (currentUserId === targetUserId && level === targetLevel) {
        routes.push([...path]);
        return;
      }

      if (level >= targetLevel) return;

      const currentUser = users.find((u) => u.id === currentUserId) as User;
      currentUser.connections.forEach((connectionId) => {
        if (!path.includes(connectionId)) {
          path.push(connectionId);
          backtrack(connectionId, level + 1);
          path.pop();
        }
      });
    };

    backtrack(userId, 0);
    setShortestRoutes(routes);
  };

  return (
    <div className="main-container">
      <h2>Welcome to Friend Bloom, {user && user.name}</h2>
      <button onClick={onSignOut}>Sign Out</button>
      <br/><br/>

      <div className="dropdown-container">
        <div className="add-connection">
          <label>Add Connection &nbsp;</label>
          <select
            onChange={(e) => setSelectedAddConnection(e.target.value)}
            value={selectedAddConnection}
          >
            <option value="" disabled>
              Select a user to add
            </option>
            {availableConnections.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          <button onClick={() => handleAddConnection(selectedAddConnection)} className="ms-3">Submit</button>
        </div>
        <br/>

        <div className="remove-connection">
          <label>Remove Connection &nbsp;</label>
          <select
            onChange={(e) => setSelectedRemoveConnection(e.target.value)}
            value={selectedRemoveConnection}
          >
            <option value="" disabled>
              Select a user to remove
            </option>
            {connections.map((userId) => (
              <option key={userId} value={userId}>
                {users.find((u) => u.id === userId)?.name}
              </option>
            ))}
          </select>
          <button onClick={() => handleRemoveConnection(selectedRemoveConnection)} className="ms-3">Submit</button>
        </div>
        <br/>

        <div className="find-route">
          <label>Find Route &nbsp;</label>
          <select
            onChange={(e) => setSelectedRouteConnection(e.target.value)}
            value={selectedRouteConnection}
          >
            <option value="" disabled>
              Select a user to find route
            </option>
            {[...levelOneConnections, ...levelTwoConnections, ...levelThreeConnections, ...levelFourConnections].map((userId) => (
              <option key={userId} value={userId}>
                {users.find((u) => u.id === userId)?.name}
              </option>
            ))}
          </select>
          <button onClick={() => findRoutes(selectedRouteConnection)} className="ms-3">Submit</button>
          <button className="ms-3" onClick={() => (setShortestRoutes([]), setSelectedRouteConnection(""))}>Clear</button>
        </div>
        <br/>

        <div className="shortest-routes">
          {shortestRoutes.length > 0 ? (
            <ul>
            {shortestRoutes.map((route, index) => (
              <div key={index}>
                {route.map((userId) => users.find((u) => u.id === userId)?.name).join(' -> ')}
              </div>
              ))}
            </ul>
          ) : ""}
        </div>

      </div>

      <div className="connections-map">
        <h3>Connections Map</h3>
        <div className="level-connections">
          <div className="row justify-content-center">
            <div className="col-md-2">Level-1 Connections</div>
            <div
              className="col-md-2 wd-connections-frame">{levelOneConnections.map((userId) => users.find((u) => u.id === userId)?.name).join(', ')}</div>
          </div>
          <br/>
          <div className="row justify-content-center">
            <div className="col-md-2">Level-2 Connections</div>
            <div
              className="col-md-2 wd-connections-frame">{levelTwoConnections.map((userId) => users.find((u) => u.id === userId)?.name).join(', ')}</div>
          </div>
          <br/>
          <div className="row justify-content-center">
            <div className="col-md-2">Level-3 Connections</div>
            <div
              className="col-md-2 wd-connections-frame">{levelThreeConnections.map((userId) => users.find((u) => u.id === userId)?.name).join(', ')}</div>
          </div>
          <br/>
          <div className="row justify-content-center">
            <div className="col-md-2">Level-4 Connections</div>
            <div
              className="col-md-2 wd-connections-frame">{levelFourConnections.map((userId) => users.find((u) => u.id === userId)?.name).join(', ')}</div>
          </div>
          <br/>
          <div className="row justify-content-center">
            <div className="col-md-2">Disconnected Users</div>
            <div
              className="col-md-2 wd-connections-frame">{disconnectedUsers.map((userId) => users.find((u) => u.id === userId)?.name).join(', ')}</div>
          </div>
          <br/>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
