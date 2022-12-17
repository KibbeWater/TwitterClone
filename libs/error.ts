export const CUSTOM_ERROR_CODES = {
	// 2xxx: success with a non-fatal error
	2000: 'Success with non-fatal error',
	// 3xxx: database error
	3000: 'Database connection error',
	3001: 'Database query error',
	// 4xxx: client error
	4000: 'Bad request',
	4001: 'Unauthorized',
	4002: 'Forbidden',
	// 5xxx: server error
	5000: 'Internal server error',
	5001: 'Service unavailable',
	5002: 'CDN error',
	5003: 'Missing environment variables',
	// 51xx: user error
	5100: 'Bad credentials',
	5101: 'Expired token',
	5102: 'Non-existing token',
	5103: 'Invalid token',
};
