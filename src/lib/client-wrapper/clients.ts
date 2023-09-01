import { PUBLIC_API_URL } from '$env/static/public';
import { decodeJwt, type JWTPayload } from 'jose';
import { OAuthApi, TodoApi, UserApi } from '../client/apis';

import {
	Configuration,
	type ConfigurationParameters,
	type RequestContext
} from '../client/runtime';
import type { Token } from '../client/models';
import { faLeaf } from '@fortawesome/free-solid-svg-icons';

export class TokenError extends Error {
	constructor(message: string) {
		super(message);
	}
}

export async function isTokenExpirationDateValidAsync(token?: string) {
	if (!token) {
		return false;
	}
	try {
		const parsedToken: JWTPayload = decodeJwt(token);
		if (!parsedToken.exp) {
			throw new TokenError('expiration token not found in jwt');
		}
		if (parsedToken.exp * 1000 < Date.now()) {
			return false;
		}
	} catch {
		return false;
	}

	return true;
}

const checkAccessToken = async (context: RequestContext, config?: ConfigurationOptions) => {
	if (config?.isTokenRequired === false) {
		return;
	}

	const headers = context.init.headers ? new Headers(context.init.headers) : new Headers();

	const accessToken = headers.get('Authorization') ?? undefined;

	if (!accessToken) {
		throw new TokenError('token required');
	}

	if (!(await isTokenExpirationDateValidAsync(accessToken))) {
		throw new TokenError('token has expired');
	}

	if (accessToken) {
		headers.set('Authorization', `${config?.token?.token_type ?? 'bearer'} ${accessToken}`);
	}

	context.init.headers = headers;
};

type ConfigurationOptions = Partial<Omit<ConfigurationParameters, 'accessToken'>> & {
	token?: Token;
	isTokenRequired?: boolean;
};

export const OAuthClient = (config: ConfigurationOptions = { isTokenRequired: true }) => {
	return new OAuthApi(
		new Configuration({
			accessToken: config?.token?.access_token,
			basePath: PUBLIC_API_URL
		})
	).withPreMiddleware(async (context) => {
		return await checkAccessToken(context, config);
	});
};

export const TodoClient = (config?: ConfigurationOptions) => {
	return new TodoApi(
		new Configuration({
			accessToken: config?.token?.access_token,
			basePath: PUBLIC_API_URL
		})
	).withPreMiddleware(async (context) => {
		return await checkAccessToken(context, config);
	});
};

export const UserClient = (config?: ConfigurationOptions) => {
	return new UserApi(
		new Configuration({
			accessToken: config?.token?.access_token,
			basePath: PUBLIC_API_URL
		})
	).withPreMiddleware(async (context) => {
		return await checkAccessToken(context, config);
	});
};
