# Flying Stars server prototype

This is a minimal WebSocket sync server for a multiplayer prototype.

## Deploy on Render
- Create a new **Web Service** from this GitHub repository.
- Runtime/language: Node.
- Build command: `npm install`
- Start command: `npm start`

After deployment, the health check is at `/health`, and the WebSocket endpoint is:
`wss://YOUR-SERVICE.onrender.com/ws`

Important:
- This prototype keeps shared state in RAM, so it resets when the service restarts/sleeps.
- It is not secure for public use. Do not send real passwords, private user information, balances, or purchases.
- The HTML game still needs client-side integration to connect to this WebSocket endpoint. Merely deploying this server does not automatically make the game multiplayer.
