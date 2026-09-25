process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/expense_tracker_test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-value-1234567890';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-value-1234567890';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.CLIENT_ORIGIN = 'http://localhost:5173';
