import { writable } from 'svelte/store';
import type { User } from '$lib/types/user/user';
import user from '$lib/stores/user';

const { set: _set, subscribe } = writable<User>({ accessToken: '', username: '' });

const login = (accessToken: string) => {
	_set({
		accessToken: accessToken,
		username: accessToken
	});
};

const logout = () => {
	_set({ accessToken: '', username: '' });
};


export default { login, logout, subscribe };
