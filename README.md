# Express Sequelize Template

A comprehensive Node.js + TypeScript boilerplate with Express.js and Sequelize ORM, featuring multi-database support, dynamic routing, and authentication system.

## Features

- **Express.js** with TypeScript
- **Sequelize ORM** with multi-database support
- **Dynamic routing system** with database-driven configuration
- **Authentication & Authorization** with JWT
- **Email services** (AWS SES integration)
- **Winston logging**
- **Multi-language support**
- **Maintenance mode**
- **CORS enabled**
- **Environment-based configuration**

## Prerequisites

- Node.js 20+
- MySQL/MariaDB
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment template:
   ```bash
   cp .env_template .env
   ```

4. Configure your environment variables in `.env`:
   - Database connections (AUTH and PBAC databases)
   - JWT secret
   - Email settings (optional)
   - AWS credentials (if using AWS SES)

## Database Setup

The boilerplate supports multiple databases:
- **AUTH database**: User authentication and roles
- **PBAC database**: Permission-based access control

Create two databases and update the `.env` file with your database credentials.

## Development

Start the development server:
```bash
npm run dev
```

This command:
- Builds the TypeScript code
- Runs the build in watch mode
- Starts the server with auto-restart

## Production

Build the application:
```bash
npm run build
```

Start the production server:
```bash
npm run serve
```

For production with PM2:
```bash
npm run build
node --env-file=.env dist/app.js &  # Start script in background
pm2 startup  # Register the running process with PM2
pm2 save
```

## Project Structure

```
src/
├── app.ts                 # Main application entry point
├── config/                # Database and environment configurations
│   ├── development/       # Development database configs
│   ├── production/        # Production database configs
│   └── dbConfig.ts        # Database configuration loader
├── controllers/           # API controllers
├── models/                # Sequelize models
│   ├── auth/             # Authentication models
│   └── pbac/             # Permission models
├── routes/               # Route definitions and dynamic loading
├── shared/               # Shared utilities and middleware
│   ├── common/           # Common utilities
│   ├── constants/        # Application constants
│   ├── email/            # Email services
│   └── middleware/       # Express middleware
└── languages/            # Multi-language support files
```

## API Structure

The application uses a dynamic routing system:
- Routes are automatically discovered from controllers
- Route configurations are stored in the database
- All API endpoints are prefixed with `/api/`

## Environment Variables

Key environment variables:
- `PORT`: Server port (default: 8080)
- `NODE_ENV`: Environment (development/production)
- `MAINTENANCE_MODE`: Enable/disable maintenance mode
- `JWT_SECRET`: Secret for JWT token signing
- `EMAIL_ENABLED`: Enable email services
- `DB_*_NAME/HOST/USERNAME/PASSWORD`: Database credentials

## Scripts

- `npm run build`: Build TypeScript to JavaScript
- `npm run build:watch`: Build in watch mode
- `npm run dev`: Development mode with hot reload
- `npm run serve`: Production server
- `npm run serve:watch`: Development server with nodemon

## License

ISC
