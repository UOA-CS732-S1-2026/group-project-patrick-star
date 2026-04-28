# AI Wardrobe Backend

Express + Mongoose REST API for the AI Wardrobe MERN app, with MongoDB persistence and Replicate-powered virtual try-on.

User authentication is handled by Auth0. The backend validates Auth0 access tokens and stores app-specific user profile data in MongoDB.

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:5001`.

### Scripts

| Command       | What it does                      |
| ------------- | --------------------------------- |
| `npm run dev` | Start the dev server with nodemon |
| `npm start`   | Start the server with Node.js     |
| `npm test`    | Run Jest tests with Supertest     |

## Tech stack

- **Node.js** runtime
- **Express** for HTTP routes and middleware
- **Mongoose** for MongoDB schemas and queries
- **MongoDB** for persistent user and clothing item data
- **Auth0** for authentication and access token issuance
- **express-oauth2-jwt-bearer** for Auth0 token validation
- **dotenv** for local environment variables
- **cors** for frontend/backend requests during development
- **replicate** for AI virtual try-on generation
- **Jest** + **Supertest** for route tests
- **nodemon** for local development reloads

## Environment setup

Create a `.env` file in `backend/`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/ai-wardrobe
PORT=5001
REPLICATE_API_TOKEN=r8_your_replicate_api_token
AUTH0_DOMAIN=your-tenant.us.auth0.com
AUTH0_AUDIENCE=https://your-api
```

| Variable              | What it does                                       |
| --------------------- | -------------------------------------------------- |
| `MONGO_URI`           | MongoDB connection string                          |
| `PORT`                | Server port, defaults to `5000`                    |
| `REPLICATE_API_TOKEN` | API token used by the try-on route                 |
| `AUTH0_DOMAIN`        | Auth0 tenant domain used to validate access tokens |
| `AUTH0_AUDIENCE`      | Auth0 API identifier expected by this backend      |

## Routes

| Method   | URL                          | What it does                                               |
| -------- | ---------------------------- | ---------------------------------------------------------- |
| `GET`    | `/`                          | Health check, returns `API running`                        |
| `POST`   | `/api/clothingItems`         | Create a clothing item                                     |
| `GET`    | `/api/clothingItems/:userId` | List clothing items for a user                             |
| `PUT`    | `/api/clothingItems/:id`     | Update a clothing item                                     |
| `DELETE` | `/api/clothingItems/:id`     | Delete a clothing item                                     |
| `POST`   | `/api/users/me/sync`         | Create the authenticated user's MongoDB profile if missing |
| `GET`    | `/api/users/me`              | Get the authenticated user's profile                       |
| `PUT`    | `/api/users/me`              | Update the authenticated user's profile                    |
| `PUT`    | `/api/users/me/photo`        | Update the authenticated user's profile photo              |
| `DELETE` | `/api/users/me`              | Delete the authenticated user's profile                    |
| `POST`   | `/api/tryon`                 | Generate a virtual try-on image with Replicate             |

## Project structure

```text
backend/
|-- app.js
|-- server.js
|-- middleware/
|   `-- auth.js
|-- routes/
|   |-- clothingItems.js
|   |-- users.js
|   `-- tryon.js
|-- models/
|   |-- ClothingItems.js
|   `-- User.js
|-- db/
|   |-- clothingService.js
|   `-- userService.js
|-- __tests__/
|   |-- clothingItems.test.js
|   |-- users.test.js
|   `-- tryon.test.js
|-- package.json
`-- package-lock.json
```

## API conventions

- Request and response bodies are JSON.
- Clothing item categories are `upper_body`, `lower_body`, or `dresses`.
- The try-on route expects `humanImageBase64`, `garmentImageBase64`, and `category`.
- MongoDB connects when `app.js` is loaded, so tests and local runs need a valid `MONGO_URI`.
- `/api/users/me*` routes require `Authorization: Bearer <access_token>`.
- The backend expects Auth0 access tokens issued for this API audience.

## Testing

Run the Jest test suite:

```bash
npm test
```

Tests live in `__tests__/` and use Supertest to exercise the Express routes.

## Frontend integration

The frontend lives in `../frontend/` (Next.js + Tailwind CSS). Point it at this API by setting `NEXT_PUBLIC_API_URL` in the frontend environment and fetching from routes under `/api/clothingItems`, `/api/users`, and `/api/tryon`.

For authenticated user routes, the frontend should:

1. Sign the user in with Auth0.
2. Request an access token for the backend API audience.
3. Send that token in the `Authorization` header when calling `/api/users/me*`.
   in the frontend environment and fetching from routes under `/api/clothingItems`, `/api/users`, and `/api/tryon`.
