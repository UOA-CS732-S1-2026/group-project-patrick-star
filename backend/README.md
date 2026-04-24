# AI Wardrobe — Backend

Express + Mongoose REST API. Backend service for the AI Wardrobe MERN app, with MongoDB persistence and Replicate-powered virtual try-on.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5001.

### Scripts

| Command       | What it does                         |
| ------------- | ------------------------------------ |
| `npm run dev` | Start the dev server with nodemon    |
| `npm start`   | Start the server with Node.js        |
| `npm test`    | Run Jest tests with Supertest        |

## Tech stack

- **Node.js** runtime.
- **Express** for HTTP routes and middleware.
- **Mongoose** for MongoDB schemas and queries.
- **MongoDB** for persistent user and clothing item data.
- **dotenv** for local environment variables.
- **cors** for frontend/backend requests during development.
- **replicate** for AI virtual try-on generation.
- **Jest** + **Supertest** for route tests.
- **nodemon** for local development reloads.

## Environment setup

Create a `.env` file in `backend/`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/ai-wardrobe
PORT=5001
REPLICATE_API_TOKEN=r8_your_replicate_api_token
```

| Variable              | What it does                         |
| --------------------- | ------------------------------------ |
| `MONGO_URI`           | MongoDB connection string            |
| `PORT`                | Server port, defaults to 5000        |
| `REPLICATE_API_TOKEN` | API token used by the try-on route   |

## Routes

| Method   | URL                                | What it does                                      |
| -------- | ---------------------------------- | ------------------------------------------------- |
| `GET`    | `/`                                | Health check — returns `API running`              |
| `POST`   | `/api/clothingItems`               | Create a clothing item                            |
| `GET`    | `/api/clothingItems/:userId`       | List clothing items for a user                    |
| `PUT`    | `/api/clothingItems/:id`           | Update a clothing item                            |
| `DELETE` | `/api/clothingItems/:id`           | Delete a clothing item                            |
| `POST`   | `/api/users`                       | Create a user                                     |
| `GET`    | `/api/users/email/:email`          | Get a user by email address                       |
| `GET`    | `/api/users/:id`                   | Get a user by ID                                  |
| `PUT`    | `/api/users/:id`                   | Update a user                                     |
| `PUT`    | `/api/users/:id/photo`             | Update a user's profile photo                     |
| `DELETE` | `/api/users/:id`                   | Delete a user                                     |
| `POST`   | `/api/tryon`                       | Generate a virtual try-on image with Replicate    |

## Project structure

```
backend/
├── app.js                         # Express app, middleware, routes, MongoDB connection
├── server.js                      # Starts the HTTP server
├── routes/
│   ├── clothingItems.js           # Clothing item CRUD endpoints
│   ├── users.js                   # User CRUD + profile photo endpoints
│   └── tryon.js                   # Replicate virtual try-on endpoint
│
├── models/
│   ├── ClothingItems.js           # ClothingItem Mongoose schema
│   └── User.js                    # User Mongoose schema
│
├── db/
│   ├── clothingService.js         # ClothingItem database helpers
│   └── userService.js             # User database helpers
│
├── __tests__/
│   ├── clothingItems.test.js      # Clothing item route tests
│   └── users.test.js              # User route tests
│
├── package.json
└── package-lock.json
```

## API conventions

- Request and response bodies are JSON.
- Clothing item categories are `upper_body`, `lower_body`, or `dresses`.
- The try-on route expects `humanImageBase64`, `garmentImageBase64`, and `category`.
- MongoDB connects when `app.js` is loaded, so tests and local runs need a valid `MONGO_URI`.

## Testing

Run the Jest test suite:

```bash
npm test
```

Tests live in `__tests__/` and use Supertest to exercise the Express routes.

## Frontend integration

The frontend lives in `../frontend/` (Next.js + Tailwind CSS). Point it at this API by setting `NEXT_PUBLIC_API_URL` in the frontend environment and fetching from routes under `/api/clothingItems`, `/api/users`, and `/api/tryon`.
