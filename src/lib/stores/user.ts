import { writable } from 'svelte/store';
import type { Token } from '$lib/client/models/Token';

export type UserWithAccessToken = ({username :string} & Token) | null; 

const { set: _set, subscribe } = writable<UserWithAccessToken>(null);
0
const login = (token: Token, username: string) => {
	_set({
		...token,
		username: username,
	});
};

const logout = () => {
	_set(null);
};


export default { login, logout, subscribe };
