import { getDistanceInKm } from "../utils/geo.js";

function getSkillScore(volunteerSkills, taskSkills) {
  if (!taskSkills.length) {
    return 30;
  }

  const volunteerSet = new Set(volunteerSkills.map((skill) => skill.toLowerCase()));
  const matchedSkills = taskSkills.filter((skill) =>
    volunteerSet.has(skill.toLowerCase())
  );

  return Math.round((matchedSkills.length / taskSkills.length) * 50);
}

function getAvailabilityScore(volunteerAvailability, taskAvailability) {
  if (!taskAvailability.length) {
    return 20;
  }

  const volunteerSet = new Set(
    volunteerAvailability.map((slot) => slot.toLowerCase())
  );
  const overlaps = taskAvailability.filter((slot) =>
    volunteerSet.has(slot.toLowerCase())
  );

  return overlaps.length > 0 ? 20 : 0;
}

function getLocationScore(volunteerCoordinates, taskCoordinates) {
  const distanceKm = getDistanceInKm(volunteerCoordinates, taskCoordinates);

  if (!Number.isFinite(distanceKm)) {
    return {
      distanceKm: null,
      locationScore: 0
    };
  }

  if (distanceKm <= 3) {
    return { distanceKm, locationScore: 30 };
  }

  if (distanceKm <= 8) {
    return { distanceKm, locationScore: 20 };
  }

  if (distanceKm <= 15) {
    return { distanceKm, locationScore: 10 };
  }

  return { distanceKm, locationScore: 0 };
}

export function buildTaskMatch(volunteer, task) {
  const skillScore = getSkillScore(volunteer.skills || [], task.requiredSkills || []);
  const availabilityScore = getAvailabilityScore(
    volunteer.availability || [],
    task.availability || []
  );
  const { distanceKm, locationScore } = getLocationScore(
    volunteer.location?.coordinates,
    task.location?.coordinates
  );

  const score = skillScore + availabilityScore + locationScore;

  return {
    taskId: task._id,
    title: task.title,
    description: task.description,
    requiredSkills: task.requiredSkills,
    availability: task.availability,
    volunteersNeeded: task.volunteersNeeded,
    filledSlots: task.filledSlots,
    urgency: task.urgency,
    status: task.status,
    ngoName: task.postedBy?.ngoName || task.postedBy?.name,
    location: task.location,
    distanceKm: distanceKm === null ? null : Number(distanceKm.toFixed(2)),
    matchScore: score,
    scoreBreakdown: {
      skillScore,
      availabilityScore,
      locationScore
    }
  };
}
