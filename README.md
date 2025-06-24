🎬 MovieFinder+

MovieFinder+ is a full-stack, modern movie discovery and cataloguing platform. It allows users to search, browse, and visualize a large database of movies and actors with secure authentication, seamless state preservation, and an attractive, responsive UI.
Built with React (Client), Node.js/Express (Server), MySQL, JWT, AG Grid, Chart.js, and more.

🗂 Directory Structure
bash
Copy
Edit
MovieFinderPlus/
│
├── Client/        # React frontend (MovieFinder+ user interface)
├── Server/        # Node.js backend (API, auth, DB access)
└── README.md      # You are here!


🚀 Features
Modern, Responsive UI using React, Bootstrap, and AG Grid

Powerful Search & Filtering (by title, year, sortable columns)

Movie & Actor Detail Pages with visual data and IMDb rating charts (Chart.js)

JWT Authentication with access/refresh tokens (secure, persistent sessions)

State Preservation — Filters, search, and pagination are restored after navigation

OpenAPI 3.0 / Swagger documentation (backend)

Production-Ready Deployment (runs on Azure VM, HTTPS with PM2)

Accessibility: Semantic HTML, alt tags, and keyboard navigation support

🛠️ Technology Stack
Layer	Tech Used
Frontend	React, AG Grid, Chart.js, Bootstrap, Reactstrap, React Router
Backend	Node.js, Express.js, MySQL, Knex.js, JWT, bcrypt, dotenv
DevOps	PM2, Azure, HTTPS (self-signed), Swagger/OpenAPI

✨ Key Screens & Functionality
Registration/Login: Secure account creation, token-based authentication, instant feedback.

Movie Catalogue: Fast, paginated table view (AG Grid) with search/filter, sorting, and easy navigation.

Movie Detail Page: See posters, year, genres, runtime, ratings, box office, cast/crew, and more.

Actor/Person Page: View all movies for a given actor, including an interactive IMDb rating bar chart.

State Persistence: Navigation restores filters, search, and current page in the catalogue.

Logout: Securely destroys session both client and server side.

🧑‍💻 Getting Started
1. Clone the Repository
bash
Copy
Edit
git clone https://github.com/yourusername/MovieFinderPlus.git
cd MovieFinderPlus
2. Environment Setup
Client and Server each have their own node_modules.

Add a .env file in Server/ (see sample below).

Server .env Example
ini
Copy
Edit
DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=moviedb
JWT_SECRET=your_jwt_secret
PORT=3001
3. Install Dependencies
bash
Copy
Edit
cd Client
npm install
cd ../Server
npm install
4. Database Setup
Set up a MySQL database (moviedb by default).

Run migrations and seed data if provided (knex migrate:latest & knex seed:run).

5. Running the Apps
Server:

bash
Copy
Edit
cd Server
node app.js
or for production:

bash
Copy
Edit
pm2 start app.js
Client:

bash
Copy
Edit
cd Client
npm start


🔗 API Endpoints (Server)
Authentication:

POST /user/register — Register new user

POST /user/login — Login, returns JWT + refresh token

POST /user/refresh — Refresh access token

POST /user/logout — Logout and invalidate session

Movies & Actors:

GET /movies/search — Search/filter movies (with pagination)

GET /movies/data/:imdbID — Movie detail, including cast/crew

GET /people/:id — Actor/person detail and full filmography

Docs:

GET /docs/openapi.json — OpenAPI 3.0 spec for Swagger/Postman

🖥️ Application Design
Navigation: Persistent navbar, clear links to Home, Movies, Register, Login/Logout, and user session indicator.

Movie Table: AG Grid with quick search, filter, sortable columns, and paginated views.

Charts: Bar charts of IMDb ratings on actor pages (Chart.js).

Session Handling: Client-side state saved with sessionStorage for non-disruptive UX.

Accessibility: Descriptive alt text, semantic HTML, high-contrast UI.


📸 Screenshots

![image](https://github.com/user-attachments/assets/8cd5bd26-ccc1-4a59-80b6-33756c9553d9)


![image](https://github.com/user-attachments/assets/82e0cf97-5b4c-432c-8a67-6ccefa67933c)


![image](https://github.com/user-attachments/assets/9f5596b1-142d-4275-862a-01a1f00c6fb6)


![image](https://github.com/user-attachments/assets/a42f6ec5-29cb-4a69-b956-6873729a3f26)


![image](https://github.com/user-attachments/assets/92ab479a-0ea3-4f41-811b-51e438653bf7)


![image](https://github.com/user-attachments/assets/55f70619-8ec0-457d-8693-df7743d32121)
![image](https://github.com/user-attachments/assets/e9e0ac53-82d0-411c-be55-1c9c11cc8be8)




