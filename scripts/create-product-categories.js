// Script to create product categories in MongoDB
// Usage: Get-Content scripts/create-product-categories.js | docker exec -i daraa-mongodb mongosh -u daraa_app -p DaraaAppPassword2024 --authenticationDatabase daraa --quiet

use daraa;

// Check if categories already exist
const existingCategories = db.categories.countDocuments();
print(`Existing categories: ${existingCategories}`);

// Create main categories
const categories = [
  {
    name: "Electronics",
    slug: "electronics",
    description: "Electronic devices and accessories",
    icon: "📱",
    level: 0,
    order: 1,
    isActive: true,
    productCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Fashion",
    slug: "fashion",
    description: "Clothing and fashion accessories",
    icon: "👔",
    level: 0,
    order: 2,
    isActive: true,
    productCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Home & Garden",
    slug: "home-garden",
    description: "Home appliances and garden tools",
    icon: "🏠",
    level: 0,
    order: 3,
    isActive: true,
    productCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Sports & Outdoors",
    slug: "sports-outdoors",
    description: "Sports equipment and outdoor gear",
    icon: "⚽",
    level: 0,
    order: 4,
    isActive: true,
    productCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Books & Media",
    slug: "books-media",
    description: "Books, movies, and music",
    icon: "📚",
    level: 0,
    order: 5,
    isActive: true,
    productCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Insert categories
try {
  const result = db.categories.insertMany(categories);
  print(`✅ Created ${Object.keys(result.insertedIds).length} categories`);
  
  // Display created categories
  print("\n📋 Created Categories:");
  db.categories.find({}, { name: 1, slug: 1, _id: 1 }).forEach(cat => {
    print(`  - ${cat.name} (${cat.slug}): ${cat._id}`);
  });
  
  // Get Electronics category ID for reference
  const electronics = db.categories.findOne({ slug: "electronics" });
  print(`\n📱 Electronics Category ID: ${electronics._id}`);
  
} catch (error) {
  if (error.code === 11000) {
    print("⚠️  Categories already exist. Fetching existing categories...");
    db.categories.find({}, { name: 1, slug: 1, _id: 1 }).forEach(cat => {
      print(`  - ${cat.name} (${cat.slug}): ${cat._id}`);
    });
    const electronics = db.categories.findOne({ slug: "electronics" });
    if (electronics) {
      print(`\n📱 Electronics Category ID: ${electronics._id}`);
    }
  } else {
    print(`❌ Error: ${error.message}`);
  }
}

