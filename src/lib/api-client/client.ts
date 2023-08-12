import { error } from '@sveltejs/kit';

export const createRequest = (url: string, token?: string): Request => {
	const request = new Request(url);
	if (token) {
		request.headers.set('Authorization', `bearer: ${token}`);
	}
	return request;
};

type ErrorHandler = <TError>(error: TError) => void;

export const get = async <TResponse, TError = unknown>(
	endPoint: string,
	parameters: Record<string, any> = {},
	config: RequestInit = {},
	onError: ErrorHandler | undefined = undefined
) => {
	const res = await fetch(
		`${import.meta.env.VITE_API_URL}${endPoint}?${new URLSearchParams(parameters)}`,
		{
			method: 'get',
			headers: {
				'Content-Type': 'application/json'
			},
			...config
		}
	);
	const json = await res.json();

	if (!res.ok) {
		if (onError) {
			return onError(<TError>json);
		}
		throw Error('Some errors has occurred');
	}

	return <TResponse>json;
};

export const post = async <TResponse, TError = unknown>(
	endPoint: string,
	data: Record<string, any> = {},
	config: RequestInit = {},
	onError: ErrorHandler | undefined = undefined
) => {
	const res = await fetch(`${import.meta.env.VITE_API_URL}${endPoint}`, {
		method: 'get',
		body: JSON.stringify(data),
		headers: {
			'Content-Type': 'application/json'
		},
		...config
	});

	const json = await res.json();
	if (!res.ok) {
		if (onError) {
			return onError(<TError>json);
		}
		throw Error('Some errors has occurred');
	}

	return <TResponse>json;
};
