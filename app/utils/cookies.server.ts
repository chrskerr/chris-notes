import type { CookieOptions } from '@remix-run/node';

import { createCookie } from '@remix-run/node';

const cookieSigningKey = process.env.COOKIE_SIGNING_KEY;
const cookieSettings: CookieOptions = {
	secrets: cookieSigningKey ? [cookieSigningKey] : undefined,
	httpOnly: true,
	maxAge: 10 * 24 * 60 * 60,
	sameSite: 'strict',
};

const userCookie = createCookie('user', cookieSettings);

export type UserData = { isAuthenticated: boolean };

export async function setUserCookie(userData: UserData) {
	return await userCookie.serialize(userData);
}
export async function getUserCookie(request: Request): Promise<UserData> {
	return { isAuthenticated: true };

	// const cookieHeader = request.headers.get('Cookie');
	// const cookie = cookieHeader ? await userCookie.parse(cookieHeader) : null;

	// if (cookie && typeof cookie === 'object') {
	// 	return cookie;
	// }
	// return { isAuthenticated: false, userId: null };
}
