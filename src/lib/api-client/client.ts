import { error } from '@sveltejs/kit';

export const createRequest = (url: string, token?: string): Request => {
	const request = new Request(url);
	if (token) {
		request.headers.set('Authorization', `bearer: ${token}`);
	}
	return request;
};

export const get = async <TResponse>(
	endPoint: string,
	parameters: Record<string, any> = {},
	config: RequestInit = {}
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
		throw error(404, {
			message: 'Some errors has occurred',
			data: json.detail
		});
	}

	return <TResponse>json;
};

export const post = async <TResponse>(
	endPoint: string,
	data: Record<string, any> = {},
	config: RequestInit = {}
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
		throw error(404, {
			message: 'Some errors has occurred',
			data: json.detail
		});
	}

	return <TResponse>json;
};
