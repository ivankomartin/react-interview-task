# Mock API Server

A simple Express.js server that provides mocked API endpoints for the React interview task frontend.

## Setup

1. Navigate to the server directory:

   ```bash
   cd server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the server:

   ```bash
   # Development mode (with auto-restart)
   npm run dev

   # Production mode
   npm start
   ```

The server will run on `http://localhost:3001`

## API Endpoints

### Products

- **GET /api/products** - Get all products
- **POST /api/products** - Create a new product

#### POST /api/products Request Body:

```json
{
  "name": "Product Name",
  "packaging": "pet|can|glass|other",
  "deposit": 100,
  "volume": 500,
  "companyId": 1,
  "registeredById": 1
}
```

### Companies

- **GET /api/companies** - Get all companies

### Users

- **GET /api/users** - Get all users

### Health Check

- **GET /health** - Server health check

## Data Storage

The server uses JSON files as a simple database:

- `data/products.json` - Products data
- `data/companies.json` - Companies data
- `data/users.json` - Users data

When you create a new product via POST /api/products, it will be automatically added to the products.json file.

## Response Format

All endpoints return responses in the following format:

```json
{
  "success": true,
  "data": [...],
  "total": 10
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```
