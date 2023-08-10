import { writable } from 'svelte/store';
import type { User } from '$lib/types/user/user';

const { set: _set, subscribe } = writable<User>({ isLoggedIn: false, username: '' });

const login = (username: string) => {
	_set({
		isLoggedIn: true,
		username: username
	});
};

const logout = () => {
	_set({ isLoggedIn: false, username: '' });
};

export default { login, logout, subscribe };
