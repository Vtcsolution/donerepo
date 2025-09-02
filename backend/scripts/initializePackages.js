const CreditPackage = require("./models/creditPackage");

async function initializeCreditPackages() {
  const packages = [
    {
      name: "Starter Plan",
      credits: 10,
      price: 6.99,
      pricePerMinute: 0.699,
      isPopular: false,
      description: "10 credits (10 minutes chat)"
    },
    {
      name: "Popular Plan",
      credits: 20,
      price: 11.99,
      pricePerMinute: 0.5995,
      isPopular: true,
      description: "20 credits (20 minutes chat)"
    },
    {
      name: "Deep Dive Plan",
      credits: 30,
      price: 16.99,
      pricePerMinute: 0.5663,
      isPopular: false,
      description: "30 credits (30 minutes chat)"
    }
  ];

  for (const pkg of packages) {
    await CreditPackage.findOneAndUpdate(
      { name: pkg.name },
      pkg,
      { upsert: true, new: true }
    );
  }
  console.log("Credit packages initialized");
}
initializeCreditPackages()
  .then(() => {
    console.log("Package initialization complete");
    process.exit(0);
  })
  .catch(err => {
    console.error("Initialization failed:", err);
    process.exit(1);
  });
module.exports = initializeCreditPackages;
