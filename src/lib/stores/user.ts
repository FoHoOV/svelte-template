import { writable } from 'svelte/store';

export type User = {
	isLoggedIn: boolean;
	username: string;
};

const user = writable<User>({ isLoggedIn: false, username: '' });

const login = (username: string) => {
	user.set({
		isLoggedIn: true,
		username: username
	});
};

const signOut = () => {
	user.set({ isLoggedIn: false, username: '' });
};

export default { login, signOut };
