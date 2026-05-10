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

| Method   | URL                                | What it does                                               |
| -------- | ---------------------------------- | ---------------------------------------------------------- |
| `GET`    | `/`                                | Health check, returns `API running`                        |
| `POST`   | `/api/users/me/sync`               | Create the authenticated user's MongoDB profile if missing |
| `GET`    | `/api/users/me`                    | Get the authenticated user's profile                       |
| `PUT`    | `/api/users/me`                    | Replace/update the authenticated user's profile            |
| `PATCH`  | `/api/users/me/profile`            | Update editable profile fields in one request              |
| `PATCH`  | `/api/users/me/body-profile`       | Update body profile fields                                 |
| `PATCH`  | `/api/users/me/style-preferences`  | Update style preferences                                   |
| `PUT`    | `/api/users/me/photo`              | Update the authenticated user's profile photo URL          |
| `POST`   | `/api/users/me/photo/upload`       | Upload a user profile/model image                          |
| `DELETE` | `/api/users/me`                    | Delete the authenticated user's profile                    |
| `POST`   | `/api/clothingItems/me`            | Create a clothing item for the authenticated user          |
| `GET`    | `/api/clothingItems/me`            | List clothing items for the authenticated user             |
| `PUT`    | `/api/clothingItems/me/:id`        | Update an authenticated user's owned clothing item         |
| `DELETE` | `/api/clothingItems/me/:id`        | Delete an authenticated user's owned clothing item         |
| `POST`   | `/api/clothingItems/me/:id/image`    | Upload an image for an owned clothing item               |
| `POST`   | `/api/outfits/me`                  | Create an outfit for the authenticated user                |
| `GET`    | `/api/outfits/me`                  | List outfits for the authenticated user                    |
| `PUT`    | `/api/outfits/me/:id`              | Update an authenticated user's owned outfit                |
| `DELETE` | `/api/outfits/me/:id`              | Delete an authenticated user's owned outfit                |
| `POST`   | `/api/tryon`                       | Generate a virtual try-on image with Replicate             |

## Project structure

```text
backend/
|-- app.js
|-- server.js
|-- middleware/
|   `-- auth.js
|-- routes/
|   |-- clothingItems.js
|   |-- outfits.js
|   |-- users.js
|   `-- tryon.js
|-- models/
|   |-- ClothingItems.js
|   |-- Outfit.js
|   `-- User.js
|-- db/
|   |-- clothingService.js
|   |-- outfitService.js
|   `-- userService.js
|-- __tests__/
|   |-- clothingItems.test.js
|   |-- outfitRoutes.test.js
|   |-- outfits.test.js
|   |-- users.test.js
|   `-- tryon.test.js
|-- package.json
`-- package-lock.json
```

## API conventions

- Request and response bodies are JSON.
- Clothing item categories are `upper_body`, `lower_body`, `dresses`, `outerwear`, `shoes`, or `accessories`.
- `GET /api/clothingItems/me` supports query filters for owned closet data.
- Outfit item IDs must belong to the authenticated user.
- Outfit items must have distinct categories; duplicate item categories are rejected.
- Profile PATCH routes reject unsupported fields and run Mongoose validators before saving.
- The try-on route expects `humanImageUrl`, `garmentImageUrl`, and `category`.
- MongoDB connects when `app.js` is loaded, so tests and local runs need a valid `MONGO_URI`.
- `/api/users/me*`, `/api/clothingItems/me*`, and `/api/outfits/me*` routes require `Authorization: Bearer <access_token>`.
- The backend expects Auth0 access tokens issued for this API audience.

## Testing

Run the Jest test suite:

```bash
npm test
```

Tests live in `__tests__/` and use Supertest to exercise the Express routes.

## Frontend integration

The frontend lives in `../frontend/` (Next.js + Tailwind CSS). Point it at this API by setting `NEXT_PUBLIC_API_URL` in the frontend environment and fetching from routes under `/api/clothingItems`, `/api/outfits`, `/api/users`, and `/api/tryon`.

For authenticated routes, the frontend should:

1. Sign the user in with Auth0.
2. Request an access token for the backend API audience.
3. Call `POST /api/users/me/sync` once after login with the user's `name` and `email`.
4. Send that token in the `Authorization` header when calling `/api/users/me*`, `/api/clothingItems/me*`, and `/api/outfits/me*`.

Current frontend pages use these routes for the home dashboard, closet management, outfit builder, favourite outfits, profile editing, onboarding sync, and sign-out flow.
