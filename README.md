# NodeMural Application

This is a Node.js web application built with Express and MariaDB.

## Prerequisites

- Node.js (v18 or higher)
- MariaDB server running locally

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=root
   DB_NAME=tccess
   DB_POOL_LIMIT=10
   JWT_SECRET=your_jwt_secret_key_change_this_in_production
   JWT_EXPIRY=7d
   PORT=3333
   ```

## Running the Application

### Start the server:
```bash
npm start
```

### For development (with auto-reload):
```bash
npm run dev
```

The application will be available at `http://localhost:3333`

## Database Setup

The application uses MariaDB. Make sure your MariaDB server is running and the database specified in `DB_NAME` exists.

## Features

- User authentication and authorization
- Student management
- Teacher management
- Internship management
- Questionnaire system
- Activity tracking
- Visit scheduling
- And more...

## Frontend Files

All frontend HTML files are located in the `public/` directory.