# FriendBloom

**FriendBloom** is a React-based application that visualizes social connections in a network. It simplifies certain operations to focus on the primary goal of showcasing relationships between users. This project uses a predefined `data.json` file to store user relationships and is deployed via Netlify.

## Features

- **View network relationships**:
  - Displays connections at various levels (Level 1 to Level 4).
- **Add or remove connections**:
  - Modify relationships between users dynamically.
- **Find shortest routes**:
  - Uses backtracking to compute the shortest path between two users.
- **Display disconnected users**:
  - Identifies users who are not directly or indirectly connected to the logged-in user.

## Technology Stack

- **Frontend**: React
- **Data Storage**: A predefined `data.json` file
- **Deployment**: Netlify with Continuous Integration and Continuous Deployment (CI/CD)

## How to Use

1. **Login**:
   - Choose a user from the available list to login. No username or password input is required for simplicity.
2. **Main Page**:
   - The main page offers options to:
     - Add a connection
     - Remove a connection
     - Find the shortest route to another user
   - It also visualizes connections at different levels and lists disconnected users.
3. **Adding a Connection**:
   - Select a user from the "Add Connection" dropdown and click "Submit."
4. **Removing a Connection**:
   - Choose a user from the "Remove Connection" dropdown and click "Submit."
5. **Finding Shortest Routes**:
   - Pick a user from the "Find Route" dropdown and click "Submit" to display the shortest paths.

## Project Structure

```plaintext
/src
  ├── data/
  │     └── userData.json    # Stores the relationship data between users
  ├── App.tsx           # Main functional component
  │     
  ├── styles.css       # Custom styling for the app
```

## Example Data Format

The app uses a JSON file to store user relationships. Here's an example:

```json
{
  "users": [
    {
      "id": "A",
      "name": "Alice",
      "connections": ["B", "C", "E"]
    },
    {
      "id": "B",
      "name": "Bob",
      "connections": ["A", "D", "F", "C", "E"]
    },
    {
      "id": "C",
      "name": "Charlie",
      "connections": ["A", "B"]
    },
    {
      "id": "D",
      "name": "David",
      "connections": ["B"]
    },
    {
      "id": "E",
      "name": "Eve",
      "connections": ["A", "B"]
    },
    {
      "id": "F",
      "name": "Frank",
      "connections": ["B"]
    }
  ]
}
```


## Deployment

The app is deployed on **Netlify** for quick and seamless CI/CD.  
Visit the live app [here](https://friendbloom.netlify.app).

### How to Deploy:

1. Push your code to the GitHub repository.
2. Link the repository to Netlify.
3. Any changes pushed to the repository will automatically redeploy the app.

---

## Main Functionality Description

### Rearrange Map

Uses **Breadth-First Search (BFS)** to categorize connections into levels:
- **Level 1:** Direct connections.
- **Level 2:** Connections of Level 1 users.
- **Level 3:** Connections of Level 2 users.
- **Level 4:** Connections of Level 3 users.

Disconnected users are those who are not part of any of these levels.

### Add Connection

Allows the logged-in user to add a new user to their connection list.  
Automatically updates the visualization.

### Remove Connection

Allows the logged-in user to remove an existing user from their connection list.  
Automatically updates the visualization.

### Find Routes

Uses **backtracking** to find all shortest routes between the logged-in user and the target user.  
Displays the possible routes clearly.

---

## License

This project is **open-source** and available for use and modification under the specified license terms.
