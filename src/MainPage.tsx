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
    // Perform BFS to determine the levels of connections
    const queue: [string, number][] = [[startUserId, 0]]; // Initialize the queue with the starting user and level 0
    const visited: Set<string> = new Set(); // Keep track of visited users
    visited.add(startUserId); // Mark the starting user as visited

    // Arrays to store users based on their connection levels
    const levelOne: string[] = [];
    const levelTwo: string[] = [];
    const levelThree: string[] = [];
    const levelFour: string[] = [];

    // Process the queue until it is empty
    while (queue.length > 0) {
      // Dequeue the current user and their level
      const [currentUserId, level] = queue.shift()!;
      // Find the current user in the list of users
      const currentUser = users.find((u) => u.id === currentUserId) as User;

      // Iterate through each connection of the current user
      currentUser.connections.forEach((connectionId) => {
        // If the connection has not been visited
        if (!visited.has(connectionId)) {
          // Mark it as visited
          visited.add(connectionId);
          // Enqueue the connection with the next level
          queue.push([connectionId, level + 1]);

          // Categorize the connection based on its level
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

    // Update the state with the categorized connections
    setLevelOneConnections(levelOne);
    setLevelTwoConnections(levelTwo);
    setLevelThreeConnections(levelThree);
    setLevelFourConnections(levelFour);

    // Identify and set users who are disconnected from the starting user
    setDisconnectedUsers(users.filter((u) =>
      !levelOne.includes(u.id)
      && !levelTwo.includes(u.id)
      && !levelThree.includes(u.id)
      && !levelFour.includes(u.id)
        // Exclude the starting user
      && u.id !== startUserId)
        // Map the disconnected users to their IDs
      .map((u) => u.id));
    // Dependency array ensures the function is recreated only when users change
  }, [users]);

  // useEffect hook to automatically call rearrangeMap when user or connections change
  useEffect(() => {
    // Ensure a valid user is available
    if (user) {
      // Rearrange the map for the current user
      rearrangeMap(user.id);
    }
    // Dependencies trigger the effect when they change
  }, [user, connections, rearrangeMap]);

  const handleAddConnection = (selectedUser: string) => {
    // Update connections
    setConnections((prevConnections) => {
      // Create a new array of connections by adding the selected user
      const newConnections = [...prevConnections, selectedUser];
      // Update the global users list with the new connections for the current user
      setUser((prevUser) =>
          prevUser
              // Update connections if user exists
              ? { ...prevUser, connections: newConnections }
              : null
      );
      setUsers((prevUsers) =>
          prevUsers.map(u =>
              u.id === userId
                  // Update connections for the current user
                  ? { ...u, connections: newConnections }
                  // Keep other users unchanged
                  : u
          )
      );
      // Return the updated connections for the current user
      return newConnections;
    });

    // Remove the selected user from the list of available connections
    setAvailableConnections((prevAvailable) => prevAvailable.filter((u) => u.id !== selectedUser));
  };

  const handleRemoveConnection = (selectedUser: string) => {
    // Update connections
    setConnections((prevConnections) => {
      // Create a new array of connections by removing the selected user
      const newConnections = prevConnections.filter((u) => u !== selectedUser);

      // Update the current user's state with the new connections
      setUser((prevUser) =>
          prevUser
              // Update connections if user exists
              ? { ...prevUser, connections: newConnections }
              : null
      );

      // Update the global users list with the new connections for the current user
      setUsers((prevUsers) =>
          prevUsers.map(u =>
              u.id === userId
                  // Update connections for the current user
                  ? { ...u, connections: newConnections }
                  // Keep other users unchanged
                  : u
          )
      );

      // Return the updated connections for the current user
      return newConnections;
    });

    // Add the removed user back to the available connections
    setAvailableConnections((prevAvailable) => {
      // Find the user being removed from connections
      const userToAddBack = users.find((u) => u.id === selectedUser);

      // If the user exists, add them back to available connections
      if (userToAddBack) {
        return [...prevAvailable, userToAddBack];
      }

      // Otherwise, return the available connections unchanged
      return prevAvailable;
    });
  };

  // Using backtracking to find all shortest routes to a target user
  const findRoutes = (targetUserId: string) => {
    // Array to store all valid routes
    const routes: string[][] = [];
    // Current path being explored, starts with the current user
    const path: string[] = [userId];

    // Determine the level of the target user within the connection hierarchy
    const targetLevel =
      levelOneConnections.includes(targetUserId) ? 1 :
        levelTwoConnections.includes(targetUserId) ? 2 :
          levelThreeConnections.includes(targetUserId) ? 3 :
            levelFourConnections.includes(targetUserId) ? 4 : 0;

    // Define a backtracking function to explore all potential routes
    const backtrack = (currentUserId: string, level: number) => {

      // If the target user is reached at the correct level, save the current path
      if (currentUserId === targetUserId && level === targetLevel) {
        // Store a copy of the path
        routes.push([...path]);
        return;
      }

      // Stop further exploration if the level exceeds the target level
      if (level >= targetLevel) return;

      // Find the current user from the users list
      const currentUser = users.find((u) => u.id === currentUserId) as User;

      // Explore each connection of the current user
      currentUser.connections.forEach((connectionId) => {

        // Avoid cycles by skipping users already in the path
        if (!path.includes(connectionId)) {
          path.push(connectionId); // Add the connection to the path
          backtrack(connectionId, level + 1); // Recursively explore the next level
          path.pop();// Backtrack by removing the last user from the path
        }
      });
    };

    backtrack(userId, 0);// Start the backtracking from the current user at level 0
    setShortestRoutes(routes);// Store the discovered routes in state
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
          <button className="ms-3" onClick={() => {setShortestRoutes([]); setSelectedRouteConnection("");}}>Clear</button>
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
