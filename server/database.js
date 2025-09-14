const sqlite3 = require("sqlite3").verbose();
const path = require("path");

class Database {
  constructor() {
    this.db = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      const dbPath = path.join(__dirname, "data", "database.sqlite");
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error("Error opening database:", err);
          reject(err);
        } else {
          console.log("Connected to SQLite database");
          resolve();
        }
      });
    });
  }

  async createTables() {
    const createTablesSQL = `
      -- Companies table
      CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        registeredAt TEXT NOT NULL
      );

      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        companyId INTEGER NOT NULL,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (companyId) REFERENCES companies (id)
      );

      -- Products table
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY,
        companyId INTEGER NOT NULL,
        registeredById INTEGER NOT NULL,
        name TEXT NOT NULL,
        packaging TEXT NOT NULL CHECK (packaging IN ("pet", "can", "glass", "tetra", "other")),
        deposit INTEGER NOT NULL,
        volume INTEGER NOT NULL,
        registeredAt TEXT NOT NULL,
        active BOOLEAN NOT NULL DEFAULT 1,
        FOREIGN KEY (companyId) REFERENCES companies (id),
        FOREIGN KEY (registeredById) REFERENCES users (id)
      );
    `;

    return new Promise((resolve, reject) => {
      this.db.exec(createTablesSQL, (err) => {
        if (err) {
          console.error("Error creating tables:", err);
          reject(err);
        } else {
          console.log("Database tables created successfully");
          resolve();
        }
      });
    });
  }

  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  async get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            reject(err);
          } else {
            console.log("Database connection closed");
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  // Company operations
  async getAllCompanies() {
    return this.all("SELECT * FROM companies ORDER BY registeredAt DESC");
  }

  async getCompanyById(id) {
    return this.get("SELECT * FROM companies WHERE id = ?", [id]);
  }

  async createCompany(company) {
    const sql = "INSERT INTO companies (id, name, registeredAt) VALUES (?, ?, ?)";
    return this.run(sql, [company.id, company.name, company.registeredAt]);
  }

  // User operations
  async getAllUsers() {
    return this.all("SELECT * FROM users ORDER BY createdAt DESC");
  }

  async getUserById(id) {
    return this.get("SELECT * FROM users WHERE id = ?", [id]);
  }

  async createUser(user) {
    const sql = "INSERT INTO users (id, companyId, firstName, lastName, email, createdAt) VALUES (?, ?, ?, ?, ?, ?)";
    return this.run(sql, [user.id, user.companyId, user.firstName, user.lastName, user.email, user.createdAt]);
  }

  // Product operations
  async getAllProducts({ page = 1, limit = 18, active = null, sort = "registeredAt", order = "desc" } = {}) {
    let sql = "SELECT * FROM products";
    let countSql = "SELECT COUNT(*) as total FROM products";
    const params = [];
    const countParams = [];

    // Apply filters
    const conditions = [];
    if (active !== null) {
      conditions.push("active = ?");
      params.push(active ? 1 : 0);
      countParams.push(active ? 1 : 0);
    }

    if (conditions.length > 0) {
      const whereClause = " WHERE " + conditions.join(" AND ");
      sql += whereClause;
      countSql += whereClause;
    }

    // Apply sorting
    const validSortFields = ["name", "registeredAt"];
    const validOrders = ["asc", "desc"];

    if (validSortFields.includes(sort) && validOrders.includes(order)) {
      sql += ` ORDER BY ${sort} ${order.toUpperCase()}`;
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    sql += " LIMIT ? OFFSET ?";
    params.push(limit, offset);

    // Get total count
    const totalResult = await this.get(countSql, countParams);
    const total = totalResult.total;

    // Get paginated results
    const products = await this.all(sql, params);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);

    return {
      data: products,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async getProductById(id) {
    return this.get("SELECT * FROM products WHERE id = ?", [id]);
  }

  async createProduct(product) {
    const sql = `INSERT INTO products 
      (companyId, registeredById, name, packaging, deposit, volume, registeredAt, active) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    const result = await this.run(sql, [
      product.companyId,
      product.registeredById,
      product.name,
      product.packaging,
      product.deposit,
      product.volume,
      product.registeredAt,
      product.active !== undefined ? (product.active ? 1 : 0) : 1,
    ]);

    return this.getProductById(result.id);
  }
}

module.exports = Database;
