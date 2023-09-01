import { PUBLIC_API_URL } from '$env/static/public';
import { decodeJwt, type JWTPayload } from 'jose';
import { OAuthApi, TodoApi, UserApi } from '../client/apis';
import {
	Configuration,
	type ConfigurationParameters,
	type RequestContext
} from '../client/runtime';

export class TokenError extends Error {
	constructor(message: string) {
		super(message);
	}
}

export async function isTokenExpirationDateValidAsync(token: string) {
	if (!token) {
		return false;
	}
	const parsedToken: JWTPayload = decodeJwt(token);
	if (!parsedToken.exp) {
		throw new TokenError('expiration token not found in jwt');
	}
	if (parsedToken.exp * 1000 < Date.now()) {
		return false;
	}
	return true;
}

const checkAccessToken = async (context: RequestContext, isTokenRequired?: boolean) => {
	if (!isTokenRequired) {
		return;
	}

	if (await isTokenExpirationDateValidAsync('context.init.headers?')) {
		return;
	}

	throw new TokenError('token has expired');
};

export const OAuthClient = (
	config?: Partial<ConfigurationParameters> & { isTokenRequired?: boolean }
) => {
	return new OAuthApi(
		new Configuration({
			accessToken: config?.accessToken,
			basePath: PUBLIC_API_URL
		})
	).withPreMiddleware(async (context) => {
		return await checkAccessToken(context, config?.isTokenRequired ?? true);
	});
};

export const TodoClient = (
	config?: Partial<ConfigurationParameters> & { isTokenRequired?: boolean }
) => {
	return new TodoApi(
		new Configuration({
			accessToken: config?.accessToken,
			basePath: PUBLIC_API_URL
		})
	).withPreMiddleware(async (context) => {
		return await checkAccessToken(context, config?.isTokenRequired ?? true);
	});
};

export const UserClient = (
	config?: Partial<ConfigurationParameters> & { isTokenRequired?: boolean }
) => {
	return new UserApi(
		new Configuration({
			accessToken: config?.accessToken,
			basePath: PUBLIC_API_URL
		})
	).withPreMiddleware(async (context) => {
		return await checkAccessToken(context, config?.isTokenRequired ?? true);
	});
};
