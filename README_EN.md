# MCP MySQL/MariaDB Database Server

A fully-featured Model Context Protocol (MCP) server providing comprehensive operations for MySQL and MariaDB databases.

## 🌟 Features

### 🗃️ Multi-Database Support
- **Connect to multiple databases simultaneously** - Manage multiple MySQL/MariaDB instances within a single MCP Server
- **Flexible connection naming** - Support for custom connection names (`main`, `test`, `analytics`, `prod`, etc.)
- **Default connection setting** - Specify the default database connection to use
- **Backward compatibility** - Existing single-database configurations work without modification

### 🌐 Multi-Transport Modes
- **stdio mode** - Standard input/output, suitable for local Claude Desktop
- **HTTP mode** - HTTP/SSE server for external and remote access
- **both mode** - Provide both stdio and HTTP connections simultaneously

### 🔒 Enterprise-Grade Security
- **SQL Injection Protection** - Automatically detect and block dangerous SQL operations
- **Connection Pool Management** - Efficiently manage database connection resources
- **SSL/TLS Support** - Secure database connection encryption
- **CORS Control** - Configurable cross-origin request settings
- **API Key Authentication** - Optional security for HTTP endpoints

### 🛠️ Comprehensive Toolset
1. `execute_query` - Execute SQL queries and updates
2. `list_tables` - List all tables in the database
3. `describe_table` - View table structure and column information
4. `test_connection` - Test a specific database connection
5. `list_connections` - List all available database connections
6. `get_connection_info` - Retrieve detailed connection information
7. `test_all_connections` - Batch test all database connections

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Build the project
npm run build
```

### 2. Configure Databases

Create a `.env` file:

#### Single Database Configuration (Backward Compatible)
```env
# Basic Database Settings
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database
DB_SSL=false

# Connection Pool Settings
DB_CONNECTION_LIMIT=10
DB_TIMEOUT=60000

# MCP Server Settings
MCP_TRANSPORT_MODE=stdio
```

#### Multi-Database Configuration (Recommended)
```env
# Define connection list
DB_CONNECTIONS=main,test,analytics
DEFAULT_DB=main

# Main Database Connection
DB_MAIN_HOST=localhost
DB_MAIN_PORT=3306
DB_MAIN_USER=main_user
DB_MAIN_PASSWORD="complex@pass#123"
DB_MAIN_NAME=main_database
DB_MAIN_SSL=false

# Test Database Connection
DB_TEST_HOST=test-server.com
DB_TEST_PORT=3306
DB_TEST_USER=test_user
DB_TEST_PASSWORD="test$pass@456"
DB_TEST_NAME=test_database
DB_TEST_SSL=true

# Analytics Database Connection
DB_ANALYTICS_HOST=analytics.company.com
DB_ANALYTICS_PORT=3306
DB_ANALYTICS_USER=analytics_user
DB_ANALYTICS_PASSWORD="analytics#789$"
DB_ANALYTICS_NAME=analytics_db
DB_ANALYTICS_SSL=true

# Connection Pool Settings
DB_CONNECTION_LIMIT=10
DB_TIMEOUT=60000
```
