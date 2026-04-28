import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { connectDatabase } from "./config/db.js";
import Location from "./models/Location.js";
import Task from "./models/Task.js";
import User from "./models/User.js";

dotenv.config();

async function seed() {
  await connectDatabase();

  await Promise.all([
    User.deleteMany({}),
    Task.deleteMany({}),
    Location.deleteMany({})
  ]);

  const [mumbaiCentral, dadarEast, kurlaWest] = await Location.create([
    {
      label: "Mumbai Central",
      city: "Mumbai",
      state: "Maharashtra",
      coordinates: { lat: 18.9697, lng: 72.8194 }
    },
    {
      label: "Dadar East",
      city: "Mumbai",
      state: "Maharashtra",
      coordinates: { lat: 19.0178, lng: 72.8478 }
    },
    {
      label: "Kurla West",
      city: "Mumbai",
      state: "Maharashtra",
      coordinates: { lat: 19.0728, lng: 72.8826 }
    }
  ]);

  const passwordHash = await bcrypt.hash("password123", 10);

  const [volunteer, ngo] = await User.create([
    {
      name: "Aarav Sharma",
      email: "aarav@example.org",
      passwordHash,
      role: "volunteer",
      skills: ["Teaching", "Food Distribution", "Logistics"],
      availability: ["weekends", "evenings"],
      location: {
        label: mumbaiCentral.label,
        city: mumbaiCentral.city,
        coordinates: mumbaiCentral.coordinates
      }
    },
    {
      name: "Riya Kapoor",
      email: "relief@example.org",
      passwordHash,
      role: "ngo",
      ngoName: "Seva Relief Collective",
      location: {
        label: dadarEast.label,
        city: dadarEast.city,
        coordinates: dadarEast.coordinates
      }
    }
  ]);

  await Task.create([
    {
      title: "Flood relief food distribution",
      description: "Support kit packing and distribution to 120 families.",
      requiredSkills: ["Food Distribution", "Logistics"],
      availability: ["weekends", "evenings"],
      volunteersNeeded: 10,
      urgency: "high",
      postedBy: ngo._id,
      location: dadarEast._id
    },
    {
      title: "Health screening camp support",
      description: "Assist with registration, queues, and patient guidance.",
      requiredSkills: ["Medical", "Logistics"],
      availability: ["weekends", "mornings"],
      volunteersNeeded: 6,
      urgency: "high",
      postedBy: ngo._id,
      location: kurlaWest._id
    }
  ]);

  console.log("Seed complete");
  console.log("Volunteer login: aarav@example.org / password123");
  console.log("NGO login: relief@example.org / password123");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed", error);
  process.exit(1);
});
