# The Luxar

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 19.1.7 and serves as the frontend for The Luxar application, an elegant e-commerce platform for luxury products.

## Features

- Modern Angular v19 architecture
- SCSS styling support
- Proxy configuration for API communication
- Comprehensive testing setup
- Integration with NestJS backend

## Development Setup

### Prerequisites

- Node.js (>= 18)
- npm or yarn
- Angular CLI v19.1.7

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

## Development Server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

For development with backend integration:

```bash
# From the root directory
npm run start:dev:client
```

This will start the Angular application with the proxy configuration to communicate with the NestJS backend.

## Code Scaffolding

Generate new components and other Angular artifacts using the Angular CLI:

```bash
# Generate a new component
ng generate component component-name

# Generate a new service
ng generate service service-name

# Generate a new pipe
ng generate pipe pipe-name

# Other available schematics
ng generate directive|pipe|service|class|guard|interface|enum|module
```

## Building

```bash
# Development build
ng build

# Production build
ng build --configuration production
```

The build artifacts will be stored in the `dist/` directory.

## Testing

### Unit Tests

```bash
# Run unit tests
ng test

# Run unit tests with coverage
ng test --code-coverage
```

### End-to-End Tests

```bash
ng e2e
```

## Project Structure

```
src/
├── app/                 # Application source code
│   ├── components/     # Reusable components
│   ├── services/       # Angular services
│   ├── models/        # TypeScript interfaces/models
│   └── shared/        # Shared modules and utilities
├── assets/            # Static assets
└── environments/      # Environment configurations
```

## Proxy Configuration

The application uses a proxy configuration to communicate with the backend API. The proxy settings can be found in `proxy.conf.json`:

```json
{
  "/api/*": {
    "target": "http://localhost:3000",
    "secure": false,
    "logLevel": "debug",
    "changeOrigin": true
  }
}
```

## Contributing

1. Ensure you have ESLint and Prettier configured in your IDE
2. Follow the Angular style guide
3. Write comprehensive tests for new features
4. Submit pull requests with detailed descriptions

## Deployment

### Netlify Deployment

This project is configured for seamless deployment on Netlify:

1. **netlify.toml Configuration**:
   - The repository includes a `netlify.toml` file that configures the build process for Netlify
   - Build command: `npm run build:prod` runs the Angular production build
   - Publish directory: `dist/the-luxar` contains the built application
   - URL path rewrites: All routes are redirected to index.html for SPA routing

2. **Deployment Steps**:
   - Connect your GitHub repository to Netlify
   - Netlify will automatically detect the configuration
   - No additional build settings are required as they're defined in `netlify.toml`
   - (Optional) Configure custom domain settings in the Netlify dashboard

3. **Environment Variables**:
   - Configure any required environment variables in the Netlify dashboard
   - For API URLs, backend services, or third-party integrations

### Manual Deployment

To deploy the build manually:

```bash
# Build for production
npm run build:prod

# The dist/the-luxar directory can be deployed to any static hosting service
```

## Further Help

To get more help on the Angular CLI use `ng help` or check out the [Angular CLI Overview and Command Reference](https://angular.io/cli).
