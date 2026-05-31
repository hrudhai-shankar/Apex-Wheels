const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, '..', 'user_plans.json');

let plans = {};

// Load existing plans from file on startup
try {
  if (fs.existsSync(FILE_PATH)) {
    const fileData = fs.readFileSync(FILE_PATH, 'utf8');
    plans = JSON.parse(fileData);
  }
} catch (err) {
  console.error('Failed to load user plans registry file:', err.message);
}

const getUserPlan = (userId) => {
  if (!userId) return 'free';
  return plans[userId.toString()] || 'free';
};

const setUserPlan = (userId, plan) => {
  if (!userId) return;
  plans[userId.toString()] = plan;
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(plans, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write user plans registry file:', err.message);
  }
};

module.exports = {
  getUserPlan,
  setUserPlan
};
