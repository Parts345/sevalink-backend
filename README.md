# SevaLink Backend

Node.js + Express + MongoDB backend for an AI-powered volunteer coordination system. 

## Features

- **Role-Based JWT Auth:** Secure access for both `volunteer` and `ngo` accounts.
- **MongoDB Data Models:** Robust schemas for Users, Tasks, and Locations.
- **Task Management:** NGOs can post tasks (integrated with location coordinates).
- **Task Acceptance Flow:** Volunteers can accept tasks, which automatically updates capacity (`filledSlots`) and tracks assigned users without overfilling.
- **AI Matching Engine:** Volunteer task feed automatically calculates a `matchScore` based on:
  - Skill overlap
  - Geographic distance (using Haversine formula)
  - Availability overlap

## Run Locally

1. Copy `.env.example` to `.env` and ensure the following variables are set:
   - `PORT=5000`
   - `MONGODB_URI=mongodb://127.0.0.1:27017/sevalink`
   - `JWT_SECRET=your_secret_here`
   - `CLIENT_URL=http://localhost:5173`
2. Start MongoDB locally or point `MONGODB_URI` to a MongoDB Atlas cluster.
3. Install dependencies by running `npm install` inside the `server` directory.
4. Run the database seed to wipe old data and load fresh, schema-compliant sample users and tasks:
   ```bash
   node src/seed.js