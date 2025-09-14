const express = require("express");
const cors = require("cors");
const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const Database = require("./database");

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database
const db = new Database();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Products API",
      version: "1.0.0",
      description:
        "A REST API for managing products, companies, and users with full CRUD operations and filtering capabilities.",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Development server",
      },
    ],
    components: {
      schemas: {
        Product: {
          type: "object",
          required: ["id", "companyId", "registeredById", "name", "packaging", "deposit", "volume", "registeredAt"],
          properties: {
            id: {
              type: "integer",
              description: "The auto-generated id of the product",
            },
            companyId: {
              type: "integer",
              description: "ID of the company that owns the product",
            },
            registeredById: {
              type: "integer",
              description: "ID of the user who registered the product",
            },
            name: {
              type: "string",
              description: "The product name",
            },
            packaging: {
              type: "string",
              enum: ["pet", "can", "glass", "tetra", "other"],
              description: "Type of packaging",
            },
            deposit: {
              type: "integer",
              description: "Deposit amount in cents",
            },
            volume: {
              type: "integer",
              description: "Volume in milliliters",
            },
            registeredAt: {
              type: "string",
              format: "date-time",
              description: "When the product was registered",
            },
            active: {
              type: "boolean",
              description: "Whether the product is active",
            },
          },
        },
        ProductInput: {
          type: "object",
          required: ["name", "packaging", "deposit", "volume", "companyId", "registeredById"],
          properties: {
            name: {
              type: "string",
              description: "The product name",
            },
            packaging: {
              type: "string",
              enum: ["pet", "can", "glass", "tetra", "other"],
              description: "Type of packaging",
            },
            deposit: {
              type: "integer",
              description: "Deposit amount in cents",
            },
            volume: {
              type: "integer",
              description: "Volume in milliliters",
            },
            companyId: {
              type: "integer",
              description: "ID of the company that owns the product",
            },
            registeredById: {
              type: "integer",
              description: "ID of the user who registered the product",
            },
          },
        },
        Company: {
          type: "object",
          required: ["id", "name", "registeredAt"],
          properties: {
            id: {
              type: "integer",
              description: "The company id",
            },
            name: {
              type: "string",
              description: "The company name",
            },
            registeredAt: {
              type: "string",
              format: "date-time",
              description: "When the company was registered",
            },
          },
        },
        User: {
          type: "object",
          required: ["id", "companyId", "firstName", "lastName", "email", "createdAt"],
          properties: {
            id: {
              type: "integer",
              description: "The user id",
            },
            companyId: {
              type: "integer",
              description: "The company id the user belongs to",
            },
            firstName: {
              type: "string",
              description: "The user's first name",
            },
            lastName: {
              type: "string",
              description: "The user's last name",
            },
            email: {
              type: "string",
              format: "email",
              description: "The user email",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "When the user account was created",
            },
          },
        },
        ApiResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              description: "Whether the request was successful - false for errors",
              example: false,
            },
            data: {
              description: "The response data (only present on successful requests)",
            },
            error: {
              type: "string",
              description: "Error message (only present on failed requests)",
              example: "Invalid request parameters",
            },
            message: {
              type: "string",
              description: "Success message (only present on successful requests)",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          required: ["success", "error"],
          properties: {
            success: {
              type: "boolean",
              description: "Always false for error responses",
              example: false,
            },
            error: {
              type: "string",
              description: "Error message describing what went wrong",
              example: "Invalid request parameters",
            },
          },
        },
        PaginationInfo: {
          type: "object",
          properties: {
            currentPage: {
              type: "integer",
              description: "Current page number",
            },
            totalPages: {
              type: "integer",
              description: "Total number of pages",
            },
            totalItems: {
              type: "integer",
              description: "Total number of items",
            },
            itemsPerPage: {
              type: "integer",
              description: "Number of items per page",
            },
            hasNextPage: {
              type: "boolean",
              description: "Whether there is a next page",
            },
            hasPreviousPage: {
              type: "boolean",
              description: "Whether there is a previous page",
            },
          },
        },
      },
    },
  },
  apis: ["./index.js"], // Path to the API files
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(cors());
app.use(express.json());

// Swagger UI
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Products API Documentation",
  })
);

// Helper function to validate product input
function validateProductInput(product) {
  const errors = [];

  if (!product.name || typeof product.name !== "string" || product.name.trim().length === 0) {
    errors.push("Name is required and must be a non-empty string");
  }

  const validPackaging = ["pet", "can", "glass", "tetra", "other"];
  if (!product.packaging || !validPackaging.includes(product.packaging)) {
    errors.push("Packaging must be one of: " + validPackaging.join(", "));
  }

  if (!product.deposit || typeof product.deposit !== "number" || product.deposit < 0) {
    errors.push("Deposit must be a positive number");
  }

  if (!product.volume || typeof product.volume !== "number" || product.volume <= 0) {
    errors.push("Volume must be a positive number");
  }

  if (!product.companyId || typeof product.companyId !== "number") {
    errors.push("Company ID is required and must be a number");
  }

  if (!product.registeredById || typeof product.registeredById !== "number") {
    errors.push("Registered by ID is required and must be a number");
  }

  return errors;
}

// Helper function to simulate network delay
function simulateNetworkDelay(minMs = 100, maxMs = 800) {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

// Routes

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     description: Retrieve a list of products with optional pagination, filtering by active status, and sorting capabilities.
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Number of items per page
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status (true/false)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [name, registeredAt]
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Successfully retrieved products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationInfo'
 *             example:
 *               success: true
 *               data:
 *                 - id: 101
 *                   companyId: 87
 *                   registeredById: 87
 *                   name: "Original Coca Cola Classic 330ml Can"
 *                   packaging: "can"
 *                   deposit: 85
 *                   volume: 330
 *                   registeredAt: "2025-09-27T00:28:00.000Z"
 *                   active: true
 *                 - id: 102
 *                   companyId: 64
 *                   registeredById: 64
 *                   name: "Classic Pepsi Max 1.5L Bottle"
 *                   packaging: "glass"
 *                   deposit: 200
 *                   volume: 1500
 *                   registeredAt: "2024-03-10T01:56:00.000Z"
 *                   active: true
 *               pagination:
 *                 currentPage: 1
 *                 totalPages: 56
 *                 totalItems: 1000
 *                 itemsPerPage: 18
 *                 hasNextPage: true
 *                 hasPreviousPage: false
 *       400:
 *         description: Bad request - invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Invalid sort field. Must be one of: name, registeredAt"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Failed to fetch products"
 */
app.get("/api/products", async (req, res) => {
  try {
    // Simulate network delay
    await simulateNetworkDelay(250, 1000);

    // Extract parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 18;
    const activeFilter = req.query.active;
    const sort = req.query.sort || "registeredAt";
    const order = req.query.order || "desc";

    // Validate pagination parameters
    if (page < 1 || limit < 1) {
      return res.status(400).json({
        success: false,
        error: "Page and limit must be positive integers",
      });
    }

    // Validate sort field
    const validSortFields = ["name", "registeredAt"];
    if (!validSortFields.includes(sort)) {
      return res.status(400).json({
        success: false,
        error: `Invalid sort field. Must be one of: ${validSortFields.join(", ")}`,
      });
    }

    // Convert active filter
    let active = null;
    if (activeFilter !== undefined) {
      active = activeFilter === "true" || activeFilter === "1";
    }

    // Get products from database
    const result = await db.getAllProducts({
      page,
      limit,
      active,
      sort,
      order,
    });

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch products",
    });
  }
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     description: "Create a new product with the provided information. New products are created as inactive (active: false) by default."
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *           example:
 *             name: "Coca Cola"
 *             packaging: "can"
 *             deposit: 25
 *             volume: 330
 *             companyId: 1
 *             registeredById: 1
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *                 message:
 *                   type: string
 *                   example: "Product created successfully"
 *             example:
 *               success: true
 *               data:
 *                 id: 1001
 *                 companyId: 1
 *                 registeredById: 1
 *                 name: "Coca Cola"
 *                 packaging: "can"
 *                 deposit: 25
 *                 volume: 330
 *                 registeredAt: "2025-01-01T12:00:00.000Z"
 *                 active: false
 *               message: "Product created successfully"
 *       400:
 *         description: Bad request - missing required fields or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Missing required fields: name, packaging, deposit, volume, companyId, registeredById"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Failed to create product"
 */
app.post("/api/products", async (req, res) => {
  try {
    const productData = req.body;

    // Validate input using our helper function
    const validationErrors = validateProductInput(productData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: validationErrors.join(", "),
      });
    }

    // Verify company and user exist
    const company = await db.getCompanyById(productData.companyId);
    if (!company) {
      return res.status(400).json({
        success: false,
        error: "Company not found",
      });
    }

    const user = await db.getUserById(productData.registeredById);
    if (!user) {
      return res.status(400).json({
        success: false,
        error: "User not found",
      });
    }

    // Simulate network delay for creation
    await simulateNetworkDelay(300, 1000);

    const newProduct = {
      companyId: parseInt(productData.companyId),
      registeredById: parseInt(productData.registeredById),
      name: productData.name.trim(),
      packaging: productData.packaging,
      deposit: parseInt(productData.deposit),
      volume: parseInt(productData.volume),
      registeredAt: new Date().toISOString(),
      active: false,
    };

    const createdProduct = await db.createProduct(newProduct);

    res.status(201).json({
      success: true,
      data: createdProduct,
      message: "Product created successfully",
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create product",
    });
  }
});

/**
 * @swagger
 * /api/companies:
 *   get:
 *     summary: Get all companies
 *     description: Retrieve a list of all companies
 *     tags: [Companies]
 *     responses:
 *       200:
 *         description: Successfully retrieved companies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Company'
 *                 total:
 *                   type: integer
 *                   description: Total number of companies
 *             example:
 *               success: true
 *               data:
 *                 - id: 1
 *                   name: "Beverage Corp"
 *                   registeredAt: "2024-01-15T10:00:00.000Z"
 *                 - id: 2
 *                   name: "Premium Drinks Ltd"
 *                   registeredAt: "2024-02-20T14:30:00.000Z"
 *               total: 40
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Failed to fetch companies"
 */
app.get("/api/companies", async (req, res) => {
  try {
    // Simulate network delay
    await simulateNetworkDelay(150, 500);

    const companies = await db.getAllCompanies();
    res.json({
      success: true,
      data: companies,
      total: companies.length,
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch companies",
    });
  }
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Successfully retrieved users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 total:
 *                   type: integer
 *                   description: Total number of users
 *             example:
 *               success: true
 *               data:
 *                 - id: 1
 *                   companyId: 1
 *                   firstName: "John"
 *                   lastName: "Smith"
 *                   email: "john.smith@beveragecorp.com"
 *                   createdAt: "2024-07-21T04:05:00.000Z"
 *                 - id: 2
 *                   companyId: 2
 *                   firstName: "Sarah"
 *                   lastName: "Johnson"
 *                   email: "sarah.johnson@premiumdrinks.com"
 *                   createdAt: "2024-11-10T06:09:00.000Z"
 *               total: 100
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Failed to fetch users"
 */
app.get("/api/users", async (req, res) => {
  try {
    // Simulate network delay
    await simulateNetworkDelay(180, 550);

    const users = await db.getAllUsers();
    res.json({
      success: true,
      data: users,
      total: users.length,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch users",
    });
  }
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     description: Check if the API server is running and healthy
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy and running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Server is running"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   description: Current server timestamp
 */
app.get("/health", async (req, res) => {
  // Simulate a quick network delay for health check
  await simulateNetworkDelay(50, 200);

  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Something went wrong!",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
  });
});

// Initialize database and start server
async function startServer() {
  try {
    console.log("🔄 Initializing database...");
    await db.connect();
    await db.createTables();
    console.log("✅ Database initialized successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Mock API server running on http://localhost:${PORT}`);
      console.log(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
      console.log("📋 Available endpoints:");
      console.log("  GET  /api/products");
      console.log("  POST /api/products");
      console.log("  GET  /api/companies");
      console.log("  GET  /api/users");
      console.log("  GET  /health");
    });
  } catch (error) {
    console.error("❌ Failed to initialize database:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🔄 Shutting down server...");
  try {
    await db.close();
    console.log("✅ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
});

process.on("SIGTERM", async () => {
  console.log("\n🔄 Shutting down server...");
  try {
    await db.close();
    console.log("✅ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
});

startServer();
