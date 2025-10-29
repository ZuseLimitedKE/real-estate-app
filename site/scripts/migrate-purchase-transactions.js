const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(MONGODB_URI);

async function migratePurchaseTransactions() {
  try {
    console.log("Starting purchase transactions migration...");
    console.log("Connecting to database...");

    await client.connect();
    console.log("Connected to database");

    const db = client.db("real-estate-app");
    const propertiesCollection = db.collection("properties");
    const purchaseTransactionsCollection = db.collection("purchase_transactions");

    // Clear existing migrated transactions
    await purchaseTransactionsCollection.deleteMany({ migrated: true });
    console.log("Cleared previous migrated transactions");

    // Create indexes
    await purchaseTransactionsCollection.createIndex({ investor_id: 1 });
    await purchaseTransactionsCollection.createIndex({ property_id: 1 });
    await purchaseTransactionsCollection.createIndex({ transaction_hash: 1 }, { unique: true });
    await purchaseTransactionsCollection.createIndex({ purchase_time: -1 });

    console.log("Created indexes");

    // Get all properties with owners
    const properties = await propertiesCollection.find({
      $or: [
        { "property_owners.0": { $exists: true } },
        { "apartmentDetails.units.owner.0": { $exists: true } }
      ]
    }).toArray();

    console.log(`Found ${properties.length} properties with owners`);

    let migratedCount = 0;
    let errorCount = 0;

    for (const property of properties) {
      try {
        // Migrate single property owners
        if (property.property_owners && property.property_owners.length > 0) {
          for (const owner of property.property_owners) {
            if (owner.owner_id && owner.amount_owned > 0) {
              const existingTransaction = await purchaseTransactionsCollection.findOne({
                investor_id: owner.owner_id,
                property_id: property._id,
                amount: owner.amount_owned
              });

              if (!existingTransaction) {
                await purchaseTransactionsCollection.insertOne({
                  investor_id: owner.owner_id,
                  investor_address: owner.owner_address,
                  property_id: property._id,
                  token_address: property.token_address || "N/A",
                  amount: owner.amount_owned,
                  price_per_token: 1,
                  total_amount: owner.amount_owned * 1,
                  transaction_hash: `migrated-${property._id}-${owner.owner_id}-${Date.now()}`,
                  transaction_type: 'primary',
                  purchase_time: owner.purchase_time || new Date(),
                  created_at: new Date(),
                  migrated: true
                });
                migratedCount++;
                console.log(`Migrated transaction for property ${property.name}, owner ${owner.owner_address}`);
              }
            }
          }
        }

        // Migrate apartment unit owners
        if (property.apartmentDetails && property.apartmentDetails.units) {
          for (const unit of property.apartmentDetails.units) {
            if (unit.owner && unit.owner.length > 0) {
              for (const owner of unit.owner) {
                if (owner.owner_id && owner.fractions_owned > 0) {
                  const existingTransaction = await purchaseTransactionsCollection.findOne({
                    investor_id: owner.owner_id,
                    property_id: property._id,
                    amount: owner.fractions_owned,
                    "unit_details.unit_id": unit.id
                  });

                  if (!existingTransaction) {
                    await purchaseTransactionsCollection.insertOne({
                      investor_id: owner.owner_id,
                      investor_address: owner.investor_address,
                      property_id: property._id,
                      token_address: unit.token_details.address,
                      amount: owner.fractions_owned,
                      price_per_token: 1,
                      total_amount: owner.fractions_owned * 1,
                      transaction_hash: `migrated-${property._id}-${unit.id}-${owner.owner_id}-${Date.now()}`,
                      transaction_type: 'primary',
                      purchase_time: owner.purchase_time || new Date(),
                      created_at: new Date(),
                      unit_details: {
                        unit_id: unit.id,
                        unit_name: `Unit ${unit.id}`
                      },
                      migrated: true
                    });
                    migratedCount++;
                    console.log(`Migrated transaction for property ${property.name}, unit ${unit.id}, owner ${owner.investor_address}`);
                  }
                }
              }
            }
          }
        }

      } catch (error) {
        console.error(`Error migrating property ${property._id}:`, error);
        errorCount++;
      }
    }

    console.log(`\nMigration completed!`);
    console.log(`Successfully migrated: ${migratedCount} transactions`);
    console.log(`Errors encountered: ${errorCount}`);

  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await client.close();
    console.log("Database connection closed");
  }
}

// Run the migration
migratePurchaseTransactions().catch(console.error);