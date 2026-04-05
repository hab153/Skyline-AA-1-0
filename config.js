const boss = "habeebullah";
const app = "skyline";
const ourboss = boss + " boss of " + app;
const money = 500000;
const age = 18;

// Age check logic
let ageStatus = "";
if (age >= 18) {
    console.log("✅️ age approved");
    ageStatus = "✅ Approved";
} else {
    console.log("Reason: Too Young.");
    ageStatus = "❌ Too Young";
}

// Export the data so server.js can use it
module.exports = {
    boss,
    app,
    ourboss,
    money,
    age,
    ageStatus
};
