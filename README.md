# Brain 2.0 - Event Management App

A React application with AWS Amplify authentication for managing events and games.

## Features

- 🔐 AWS Cognito Authentication
- 📅 Event Management
- 🎮 Game Integration
- 📊 Statistics Tracking

## Live Demo

The application is deployed on GitHub Pages: [https://MVVolodymyr.github.io/Brain-2.1](https://MVVolodymyr.github.io/Brain-2.1)

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn
- AWS Account with Amplify configured

### Installation

1. Clone the repository:
```bash
git clone https://github.com/MVVolodymyr/Brain-2.1.git
cd Brain-2.1
```

2. Install dependencies:
```bash
npm install
```

3. Configure AWS Amplify:
   - Make sure your `aws-exports.js` file is properly configured
   - Ensure your AWS Cognito User Pool is set up correctly

4. Start the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (one-way operation)

## Deployment

This project is automatically deployed to GitHub Pages using GitHub Actions. The deployment workflow:

1. Builds the React app
2. Deploys the built files to the `gh-pages` branch
3. GitHub Pages serves the app from the `gh-pages` branch

## Project Structure

```
src/
├── App.js              # Main React component with authentication
├── index.js            # React app entry point
├── aws-exports.js      # AWS Amplify configuration
└── amplifyconfiguration.json

public/
├── index.html          # Main HTML template
├── events.html         # Events management page
├── script.js           # Events page JavaScript
└── style.css           # Styling

game/                   # Game-related files
├── index.html
├── game.js
├── core.js
└── audio/              # Game audio files
```

## Authentication Flow

1. User visits the app
2. AWS Amplify shows login/signup form
3. After successful authentication, user is redirected to `/events.html`
4. The events page uses the stored JWT token for API calls

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is private and proprietary.
