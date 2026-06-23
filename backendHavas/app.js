import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import helmet from "helmet";
import cors from "cors";

// Import main router
import routes from "./routes/index.js";

// Import error handlers
import { errorHandler, notFoundHandler } from "./middlewares/errorMiddleware.js";

const app = express();

// Security and utility middlewares
app.use(helmet());
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Static file serving (uploads)
app.use('/uploads', express.static(path.join(import.meta.dirname, 'uploads')));
app.use(express.static(path.join(import.meta.dirname, './public')));

// API Routes
app.use('/api', routes);

// 404 Handler for unmatched routes
app.use(notFoundHandler);

// Global Error Handler (must be the last middleware)
app.use(errorHandler);

export default app;
