# NumberNinja API

This is the backend API repository for [NumberNinja](https://github.com/adamrichardturner/numberninja), an arithmetic practice game built with React Native and Expo by [Adam Richard Turner](https://www.adamrichardturner.dev/).

## Overview

NumberNinja API is a robust backend service that powers the NumberNinja arithmetic practice game. It handles user sessions, question generation, performance tracking, and authentication services.

## Tech Stack

-   **Node.js & Express.js**: Server framework
-   **TypeScript**: Programming language
-   **PostgreSQL**: Database
-   **Firebase Admin SDK**: Authentication
-   **Jest & Supertest**: Testing

## Key Features

### Authentication

-   Firebase authentication integration
-   JWT token validation
-   Protected routes

### Session Management

-   Dynamic session creation and tracking
-   Customizable practice parameters
-   Multiple operation support (Addition, Subtraction, Multiplication, Division)

### Question Generation

-   Dynamic question generation based on difficulty levels
-   Support for various number ranges
-   Multiple operation modes
-   Customizable time limits

### Performance Tracking

-   Detailed session statistics
-   Operation-specific performance metrics
-   Progress tracking over time
-   Common mistake analysis

### User Data Management

-   Secure user data storage
-   Account deletion functionality
-   Performance history

## Testing

The application includes comprehensive test coverage using Jest and Supertest:

-   Integration tests for all API endpoints
-   Authentication testing
-   Session management testing
-   Question generation testing
-   Performance tracking testing

Test files can be found in the `src/__tests__` directory.

## Database Schema

The application uses a PostgreSQL database with tables for:

-   Users
-   Sessions
-   Questions
-   User Answers
-   Modes
-   Operations
-   Difficulty Levels
-   Number Ranges

## API Routes

-   `/api/auth`: Authentication endpoints
-   `/api/sessions`: Session management
-   `/api/questions`: Question generation and submission
-   `/api/performance`: Performance tracking and statistics
-   `/api/user`: User data management

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
DATABASE_URL=your_database_url
PORT=3000
```

4. Run development server:

```bash
npm run dev
```

5. Run tests:

```bash
npm test
```

## Project Setup

### Prerequisites

-   Node.js (v16 or higher)
-   PostgreSQL (v14 or higher)
-   Firebase Admin SDK credentials

### Installation Steps

1. Clone the repository:

```bash
git clone <repository-url>
cd numberninja-api
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create two files in the project root:

-   `.env.development.local` (for development)
-   `.env.production.local` (for production)

Add the following variables to both files:

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/numberninja

# Server
PORT=3000
NODE_ENV=development # or production

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

4. Set up Firebase Admin SDK:

-   Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
-   Generate a new private key from Project Settings > Service Accounts
-   Save the generated JSON as `src/config/firebase-adminsdk-key.json`

5. Database Setup:

a. Create PostgreSQL database:

```bash
createdb numberninja
```

b. Run the schema file:

```bash
psql -d numberninja -f src/database/schema.sql
```

The schema creates the following tables:

-   difficulty_levels
-   modes
-   number_ranges
-   operations
-   users
-   sessions
-   questions
-   user_answers

6. Ensure the Frontend Repository references the correct API URL in the relevant config and API service files, alternatively test the API locally with cURL or Postman.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
