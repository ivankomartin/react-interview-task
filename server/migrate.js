const Database = require("./database");
const fs = require("fs").promises;
const path = require("path");

async function readJsonFile(filename) {
  try {
    const filePath = path.join(__dirname, "data", filename);
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
}

async function migrate() {
  const db = new Database();

  try {
    console.log("🔄 Starting database migration...");

    // Connect to database
    await db.connect();

    // Create tables
    await db.createTables();

    // Read JSON data
    console.log("📖 Reading JSON data files...");
    const companies = await readJsonFile("companies.json");
    const users = await readJsonFile("users.json");
    const products = await readJsonFile("products.json");

    console.log(`Found ${companies.length} companies, ${users.length} users, ${products.length} products`);

    // Migrate companies
    console.log("🏢 Migrating companies...");
    for (const company of companies) {
      await db.createCompany(company);
    }
    console.log(`✅ Migrated ${companies.length} companies`);

    // Migrate users
    console.log("👤 Migrating users...");
    for (const user of users) {
      await db.createUser(user);
    }
    console.log(`✅ Migrated ${users.length} users`);

    // Migrate products
    console.log("📦 Migrating products...");
    let count = 0;
    for (const product of products) {
      await db.createProduct(product);
      count++;
      if (count % 1000 === 0) {
        console.log(`  Migrated ${count}/${products.length} products...`);
      }
    }
    console.log(`✅ Migrated ${products.length} products`);

    console.log("🎉 Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await db.close();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrate();
}

module.exports = migrate;
