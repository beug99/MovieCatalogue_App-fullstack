🎬 MovieFinder+ (Client)

A responsive, React-based movie discovery platform allowing users to search, browse, and explore a vast database of movies with dynamic filtering, rating visualizations, and cast exploration. This is the client-side application of the full-stack project.

🚀 Features
🔍 Search & Filter: Search movies by title or filter by release year using interactive UI.

📊 Dynamic Visuals: Visualize actor IMDb ratings via Chart.js bar charts.

📄 State Preservation: Uses sessionStorage to maintain search filters and page state when navigating between views.

🔐 Authentication: Secure JWT-based login with automatic token refresh and route protection.

📚 Cast & Crew Navigation: View detailed actor pages with filmographies and interactive charts.

📱 Responsive Design: Mobile-friendly, component-scoped styling with a cinema-themed layout.

🧩 Tech Stack
Frontend: React, React Router, Bootstrap 5, ReactStrap

Charts: Chart.js

Tables: AG Grid

Auth & State: JWT, sessionStorage, React Context

Styling: Custom CSS, Bootstrap

📂 Project Structure
css
Copy code
Client/
├── public/
│   └── img/ (static assets)
├── src/
│   ├── components/ (Nav, Footer, Header, SearchBar)
│   ├── pages/ (Home, Login, Register, MovieCatalogue, Movie, Actor)
│   ├── services/ (AuthService.js)
│   ├── CSS/ (page-specific stylesheets)
│   └── App.jsx
└── vite.config.js
🔐 Authentication Flow
/user/register: Register a new user.

/user/login: Login and retrieve JWT + refresh token.

/user/refresh: Automatically called on token expiry.

/user/logout: Ends session and clears tokens.

🔁 REST API Endpoints Used
GET /movies/search – Paginated movie search by title & year.

GET /movies/data/:imdbID – Fetch movie details & crew.

GET /people/:id – Get actor’s full filmography.

POST /user/register – Create a new account.

POST /user/login – Authenticate a user.

POST /user/refresh – Refresh access token.

POST /user/logout – Invalidate refresh token.

📸 Screenshots

![image](https://github.com/user-attachments/assets/8cd5bd26-ccc1-4a59-80b6-33756c9553d9)


![image](https://github.com/user-attachments/assets/82e0cf97-5b4c-432c-8a67-6ccefa67933c)


![image](https://github.com/user-attachments/assets/9f5596b1-142d-4275-862a-01a1f00c6fb6)


![image](https://github.com/user-attachments/assets/a42f6ec5-29cb-4a69-b956-6873729a3f26)


![image](https://github.com/user-attachments/assets/92ab479a-0ea3-4f41-811b-51e438653bf7)


![image](https://github.com/user-attachments/assets/55f70619-8ec0-457d-8693-df7743d32121)
![image](https://github.com/user-attachments/assets/e9e0ac53-82d0-411c-be55-1c9c11cc8be8)




