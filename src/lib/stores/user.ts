import type { Token } from '$lib/client/models/Token';
import { sessionWritable } from '@macfja/svelte-persistent-store';

export type UserWithAccessToken = ({ username: string } & Token) | null;

const { set: _set, subscribe } = sessionWritable<UserWithAccessToken>('user-access-token', null);
0;
const login = (token: Token, username: string) => {
	_set({
		...token,
		username: username
	});
};

const logout = () => {
	_set(null);
};

export default { login, logout, subscribe };
