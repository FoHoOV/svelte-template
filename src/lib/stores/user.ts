import { writable } from 'svelte/store';

export type User = {
	isLoggedIn: boolean;
	username: string;
};

const { set: _set, subscribe } = writable<User>({ isLoggedIn: false, username: '' });

const login = (username: string) => {
	_set({
		isLoggedIn: true,
		username: username
	});
};

const signOut = () => {
	_set({ isLoggedIn: false, username: '' });
};

export default { login, signOut, subscribe };
