# EstateNexus - Real Estate Management System
> **MCA Semester 3 Full-Stack Capstone Project**  
> Built with **React.js (Vite)**, **Python Flask**, and **SQLite (SQLAlchemy ORM)**.

---

## 🏢 Project Overview

**EstateNexus** is a real-world, production-grade Real Estate Management System connecting property buyers, tenants, licensed real estate agents, and platform administrators across Gujarat's high-demand property corridors (Ahmedabad, Gandhinagar, Surat, and Vadodara).

The application eliminates static demos and dummy workflows by providing:
- Real relational database models in **SQLite** with foreign keys, cascaded relationships, and unique slot constraints.
- Real **JWT authentication** with role-based access control (RBAC).
- Complete property listing lifecycle (Agent Creation → Admin Review & Approval/Rejection → Buyer Search & Visit Booking → Availability Updates & Transaction Logging).
- Independent role-based portals for **Buyers**, **Agents**, and **Administrators**.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, React Router DOM v7, Axios, Lucide React icons, Modular CSS3 |
| **Backend** | Python 3.13, Flask 3.0, Flask-CORS, Flask-SQLAlchemy 3.1, Flask-JWT-Extended 4.6, Werkzeug |
| **Database** | SQLite with SQLAlchemy ORM (`instance/real_estate.db`) |
| **Auth & Security** | JWT Access Tokens, PBKDF2 Password Hashing, RBAC Middleware, File Upload Validation |

---

## 👥 Demo User Accounts (Pre-Seeded)

The database includes pre-configured demo accounts for instant evaluation and testing. You can also use the **1-Click Demo Login** buttons on the Login page (`http://127.0.0.1:5173/login`).

| Role | Name | Email | Password | Details |
| :--- | :--- | :--- | :--- | :--- |
| 👑 **Admin** | System Administrator | `admin@realestate.com` | `Admin@123` | Full administrative control, property approvals, user suspensions, analytics |
| 💼 **Agent 1** | Rajesh Patel | `rajesh.patel@gujaratproperties.com` | `Agent@123` | Gujarat Premier Realty (Ahmedabad & Gandhinagar listings) |
| 💼 **Agent 2** | Priya Sharma | `priya.sharma@sharmahomes.in` | `Agent@123` | Metro Landmarks (Surat & Vadodara listings) |
| 🏠 **Buyer 1** | Amit Shah | `amit.shah@gmail.com` | `Buyer@123` | IT professional in Ahmedabad (2 favorites, 1 inquiry, 1 confirmed visit) |
| 🏠 **Buyer 2** | Neha Desai | `neha.desai@gmail.com` | `Buyer@123` | Architect looking for properties in Surat & Gandhinagar |
| 🏠 **Buyer 3** | Rohit Mehta | `rohit.mehta@gmail.com` | `Buyer@123` | Commercial space investor |

---

## 📁 Project Structure

```
Python_job/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # Flask app factory, CORS & blueprint registrations
│   │   ├── models/              # SQLAlchemy database models
│   │   │   ├── user.py          # Users table & authentication
│   │   │   ├── property.py      # Properties & PropertyImages tables
│   │   │   ├── favorite.py      # Saved wishlist properties table
│   │   │   ├── inquiry.py       # Buyer inquiries & agent responses table
│   │   │   ├── visit.py         # Scheduled site visits table (slot constraint)
│   │   │   ├── notification.py  # User notifications table
│   │   │   ├── transaction.py   # Property sales & rental records table
│   │   │   └── contact.py       # Public contact messages table
│   │   ├── routes/              # RESTful API route blueprints
│   │   │   ├── auth.py          # Register, Login, Me, Profile update
│   │   │   ├── properties.py    # Public search, filters, agent property CRUD
│   │   │   ├── favorites.py     # Buyer wishlist management
│   │   │   ├── inquiries.py     # Inquiries creation and response updates
│   │   │   ├── visits.py        # Site visit booking and confirmation
│   │   │   ├── notifications.py # Notification polling & mark-read
│   │   │   ├── admin.py         # Approvals, users, dashboard stats, reports
│   │   │   └── contact.py       # Public contact message submissions
│   │   ├── middleware/
│   │   │   └── auth.py          # JWT verification & @role_required decorator
│   │   └── utils/
│   │       └── helpers.py       # Upload validation, safe filename, notifications
│   ├── instance/
│   │   └── real_estate.db       # SQLite local database
│   ├── uploads/
│   │   └── properties/          # Uploaded property images
│   ├── config.py                # Environment configuration
│   ├── extensions.py            # db, jwt, cors singletons
│   ├── run.py                   # Server entrypoint
│   ├── seed.py                  # Seed script with realistic Gujarat listings
│   ├── test_api.py              # Automated test suite verifying APIs
│   ├── requirements.txt         # Python dependencies
│   └── .env                     # Local environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components & CSS
│   │   │   ├── Navbar.jsx & .css
│   │   │   ├── Footer.jsx & .css
│   │   │   ├── PropertyCard.jsx & .css
│   │   │   ├── DashboardSidebar.jsx & .css
│   │   │   ├── Modal.jsx & .css
│   │   │   ├── Toast.jsx & .css
│   │   │   ├── EmptyState.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx  # User session, login/logout, notifications
│   │   │   └── ToastContext.jsx # Toast notifications system
│   │   ├── services/
│   │   │   └── api.js           # Axios instance with Bearer interceptor & INR format
│   │   ├── pages/
│   │   │   ├── public/          # Home, Properties, PropertyDetails, About, Contact
│   │   │   ├── auth/            # Login, Register
│   │   │   ├── buyer/           # BuyerDashboard, Favorites, Inquiries, Visits, Profile
│   │   │   ├── agent/           # AgentDashboard, Listings, Add/Edit, Inquiries, Visits
│   │   │   └── admin/           # AdminDashboard, Approvals, Users, Inquiries, Reports
│   │   ├── App.jsx              # Client routing & ProtectedRoute guards
│   │   ├── main.jsx             # React DOM root
│   │   └── index.css            # Design tokens, typography & utilities
│   ├── package.json
│   └── vite.config.js           # Dev server proxy configuration (/api -> :5000)
│
└── README.md
```

---

## ⚡ Setup & Execution Instructions (Windows PowerShell)

Follow these exact commands to run the application locally on Windows:

### 1. Prerequisites
- **Python 3.10+** (verify with `py --version`)
- **Node.js 18+** & **npm** (verify with `node --version` and `npm --version`)

---

### 2. Backend Setup & Run

Open a Windows PowerShell terminal in the project directory:

```powershell
# Navigate to backend folder
cd "d:\MCA SEM 3\Python_job\backend"

# 1. Create a Python virtual environment
py -m venv venv

# 2. Activate the virtual environment
.\venv\Scripts\Activate.ps1

# 3. Install required Python packages
pip install -r requirements.txt

# 4. Seed the SQLite database with Gujarat property listings & demo accounts
python seed.py

# 5. Run the automated test suite to verify all APIs
python test_api.py

# 6. Start the Flask backend server
python run.py
```
> The Flask REST API will start on: **`http://127.0.0.1:5000`**

---

### 3. Frontend Setup & Run

Open a **second** Windows PowerShell terminal:

```powershell
# Navigate to frontend folder
cd "d:\MCA SEM 3\Python_job\frontend"

# 1. Install Node.js dependencies
npm install

# 2. Start the Vite React development server
npm run dev -- --host 127.0.0.1
```
> The React web application will start on: **`http://127.0.0.1:5173`**

---

## 🔄 Real-World Application Workflows

### 1. Property Listing & Admin Verification Workflow
1. An Agent logs in and clicks **"List Property"** (`/agent/properties/new`).
2. The agent fills out title, description, purpose (Buy/Rent), city (Ahmedabad, Gandhinagar, Surat, Vadodara), bedrooms, bathrooms, area, amenities checklist, and uploads property photos.
3. The listing is saved in SQLite with `listing_status = 'pending'`.
4. A notification is automatically generated for the Administrator.
5. The Administrator logs into the **Admin Portal** (`/admin/properties`), reviews the submitted specifications and photos.
6. The Admin clicks **Approve** (or rejects with feedback reason).
7. Once approved, the property immediately appears in the public property search and featured catalog for all buyers.

### 2. Buyer Search, Inquiry & Notification Workflow
1. A Buyer navigates to **Properties** (`/properties`) and filters by City, Price slider, Bedrooms, or Category.
2. Clicking any property opens **Property Details** (`/properties/:id`).
3. The buyer clicks the **Heart icon** to save the property to their persistent wishlist (`/buyer/favorites`).
4. On the sticky action sidebar, the buyer fills the **"Send Inquiry"** form with questions and preferred callback time.
5. The inquiry is saved to SQLite and an alert is delivered to the listing agent.
6. The Agent opens **Received Inquiries** (`/agent/inquiries`), views buyer contact information, types a response, and updates status to `responded`.
7. The Buyer receives a notification and views the agent's response in **My Inquiries** (`/buyer/inquiries`).

### 3. Site Visit Scheduling & Execution Workflow
1. On the property details page, the buyer selects the **"Schedule Visit"** tab.
2. The buyer chooses a date and time slot (e.g. `10:00 AM - 11:00 AM`) and enters notes.
3. The database validates against duplicate bookings for the same user, property, and time slot.
4. The Agent views the request under **Manage Site Visits** (`/agent/visits`) and clicks **"Confirm"** with meeting point instructions.
5. The buyer sees the status change to `confirmed` in **Scheduled Visits** (`/buyer/visits`).
6. After the walkthrough, the agent marks the visit as `completed`.

### 4. Deal Execution & Transaction Recording Workflow
1. When a property is sold or leased, the agent opens **My Property Listings** (`/agent/properties`).
2. The agent clicks on the availability badge and changes it to **Sold** or **Rented**.
3. The system updates the listing availability and records a transaction entry in `property_transactions`.
4. The Administrator can audit all completed deals under **Reports & Analytics** (`/admin/reports`).

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/register` — Register a new Buyer or Agent
- `POST /api/auth/login` — Authenticate and receive JWT access token
- `GET /api/auth/me` — Get profile and role-specific counters (Requires JWT)
- `PUT /api/auth/profile` — Update profile, agency name, phone, bio, password

### Properties
- `GET /api/properties` — Public search (Filters: search, purpose, property_type, city, min_price, max_price, bedrooms, furnishing, parking, sort, page)
- `GET /api/properties/featured` — Top approved available properties
- `GET /api/properties/:id` — Property details with images, amenities, and agent profile
- `POST /api/properties` — Create listing (Agent only, sets `listing_status='pending'`)
- `PUT /api/properties/:id` — Update listing (Agent owner or Admin)
- `DELETE /api/properties/:id` — Delete listing (Agent owner or Admin)
- `GET /api/properties/agent/my-listings` — List agent's properties with all statuses
- `POST /api/properties/upload-image` — Upload image file (PNG, JPG, WEBP)
- `PATCH /api/properties/:id/availability` — Update status to available, reserved, sold, rented

### Favorites
- `GET /api/favorites` — View current buyer's saved properties
- `POST /api/favorites/:property_id` — Add property to favorites
- `DELETE /api/favorites/:property_id` — Remove property from favorites
- `GET /api/favorites/check/:property_id` — Check favorite status

### Inquiries
- `POST /api/inquiries` — Submit inquiry for property (Buyer only)
- `GET /api/inquiries/buyer` — View buyer's submitted inquiries
- `GET /api/inquiries/agent` — View agent's received inquiries
- `GET /api/inquiries/:id` — View single inquiry
- `PATCH /api/inquiries/:id/status` — Respond to inquiry and update status (Agent/Admin)

### Property Visits
- `POST /api/visits` — Request site visit appointment (Buyer only, validates slot uniqueness)
- `GET /api/visits/buyer` — View buyer's scheduled visits
- `GET /api/visits/agent` — View agent's received visit requests
- `PATCH /api/visits/:id/status` — Confirm, decline, complete, or cancel visit

### Notifications
- `GET /api/notifications` — Fetch user's notification list and unread count
- `PATCH /api/notifications/:id/read` — Mark notification as read
- `PATCH /api/notifications/read-all` — Mark all notifications as read

### Admin Portal
- `GET /api/admin/dashboard` — Platform overview metrics and activity queues
- `GET /api/admin/users` — List all registered users (filter by role/status)
- `PATCH /api/admin/users/:id/status` — Activate, deactivate, or suspend user
- `GET /api/admin/properties` — List all listings (filter by pending/approved/rejected)
- `PATCH /api/admin/properties/:id/approve` — Approve listing and publish live
- `PATCH /api/admin/properties/:id/reject` — Reject listing with feedback reason
- `GET /api/admin/inquiries` — View platform-wide inquiries log
- `GET /api/admin/visits` — View platform-wide scheduled visits
- `GET /api/admin/reports` — City distribution, property categories, transactions audit

### Contact
- `POST /api/contact` — Submit public contact message (saved to database)
- `GET /api/contact/messages` — Admin review contact messages

---

## 🧪 Verification & Automated Testing

An automated test suite is included in `backend/test_api.py`. It tests:
1. Health check endpoint (`/api/health`)
2. Public properties search and city filtering
3. Featured listings retrieval
4. Buyer authentication, profile retrieval, favorites, and inquiries
5. Agent authentication, property management, and received inquiries
6. Admin authentication, dashboard metrics, and analytical reports

To run the tests:
```powershell
cd "d:\MCA SEM 3\Python_job\backend"
.\venv\Scripts\python test_api.py
```
Output:
```
--- 1. Testing Health Check ---
Health check OK: {'status': 'healthy', 'system': 'Real Estate Management System API', 'version': '1.0.0'}

--- 2. Testing Public Properties Search ---
Found 4 properties in Ahmedabad (Total: 4)

--- 3. Testing Featured Properties ---
Featured properties count: 4

--- 4. Testing Buyer Login & Profile ---
Buyer profile OK: Amit Shah
Buyer favorites count: 2
Buyer inquiries count: 1

--- 5. Testing Agent Login & Dashboard Endpoints ---
Agent listings count: 8
Agent received inquiries: 1

--- 6. Testing Admin Login & Dashboard ---
Admin dashboard stats OK: {'approved_properties': 13, 'pending_inquiries': 1, 'pending_properties': 1, ...}

All Backend Test Assertions Passed Successfully!
```

---

## 🎓 Academic Suitability
This project was constructed specifically to fulfill MCA Degree Semester 3 Full-Stack Web Development curriculum expectations, demonstrating:
- Separation of concerns between frontend client and backend REST API.
- Relational schema design with SQLite and SQLAlchemy ORM.
- Stateful user role experiences without storing operational data in client-side storage.
- Practical Indian real estate market scenarios focusing on Gujarat's metropolitan centers.
