# Online Medicine Shop Backend

This is the backend for the Online Medicine Shop, a Node.js application providing RESTful APIs for managing users, products, orders, prescriptions, and payments in an online medicine store.

## Features

- **Authentication and Authorization**: User registration and login with JWT authentication.
- **Product Management**: CRUD operations for products, with role-based access control for admin and pharmacy users.
- **Shopping Cart**: Add, update, and remove items from the user's cart.
- **Order Processing**: Create orders from the cart and manage order statuses.
- **Prescription Handling**: Upload and verify prescriptions for orders that require them.
- **Payment Processing**: Handle payments for orders.
- **Role-Based Access Control**: Different functionalities for users, admins, and pharmacy staff.
- **Error Handling**: Centralized error handling and input validation.

## Technologies Used

- **Node.js** and **Express.js**
- **MongoDB** with **Mongoose**
- **JSON Web Tokens (JWT)**
- **bcrypt.js** for password hashing
- **Multer** and **Cloudinary** for file uploads
- **dotenv** for environment variables

## Getting Started

### Prerequisites

- **Node.js** and **npm** installed
- **MongoDB** installed locally or a MongoDB Atlas account

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/online-medicine-shop-backend.git
   ```

2. **Navigate to the project directory:**

   ```bash
   cd online-medicine-shop-backend
   ```

3. **Install dependencies:**

   ```bash
   npm install
   ```

4. **Configure environment variables:**

   Create a `.env` file in the root directory and add the following variables (refer to `.env.example`):

   ```.env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/medicine-shop
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

### Running the Application

Start the server in development mode:

```bash
npm run dev
```

The server will run at `http://localhost:5000`.

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Log in a user

### Products

- `GET /api/v1/products` - Retrieve all products
- `GET /api/v1/products/:id` - Retrieve a product by ID
- `GET /api/v1/products/search?query=your_search_query` - Search for products

*Protected routes (Admin/Pharmacy only):*

- `POST /api/v1/products` - Create a new product
- `PUT /api/v1/products/:id` - Update a product
- `DELETE /api/v1/products/:id` - Delete a product

### Cart

- `GET /api/v1/cart` - Get the current user's cart
- `POST /api/v1/cart/add` - Add items to the cart
- `PUT /api/v1/cart/update` - Update cart items
- `DELETE /api/v1/cart/remove/:itemId` - Remove an item from the cart

### Orders

- `POST /api/v1/orders/create` - Create a new order
- `GET /api/v1/orders` - Get the current user's orders
- `GET /api/v1/orders/:id` - Get details of a specific order
- `PUT /api/v1/orders/:id/cancel` - Cancel an order

### Prescriptions

- `POST /api/v1/prescriptions/upload/:orderId` - Upload a prescription image
- `GET /api/v1/prescriptions/my-prescriptions` - Get the user's prescriptions

*Protected routes (Admin/Pharmacy only):*

- `GET /api/v1/prescriptions/pending` - Get pending prescriptions
- `PUT /api/v1/prescriptions/:id/verify` - Verify a prescription

### Payments

- `POST /api/v1/payments/checkout` - Process a payment

## Project Structure

```tree
minor-project/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
├── .env.example
├── package.json
└── README.md
```

## License

This project is licensed under the MIT License.
