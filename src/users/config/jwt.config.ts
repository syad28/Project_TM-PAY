import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
    secret: process.env.JWT_SECRET || 'tmpay-default-secret-key-change-this-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'tmpay-refresh-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: process.env.JWT_ISSUER || 'tmpay-api',
    audience: process.env.JWT_AUDIENCE || 'tmpay-users',
}));