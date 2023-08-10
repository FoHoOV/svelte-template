import { writable } from 'svelte/store';
import type { Todo } from '$lib/types/user';

const { set: _set, subscribe, update: _update } = writable<Todo[]>([]);

const addTodo = (todo: Omit<Todo, 'id' | 'isDone'>): void => {
	_update((value) => {
		return [...value, { ...todo, isDone: false, id: crypto.randomUUID() }];
	});
};

const removeTodo = (todo: Todo) => {
	_update((value) => {
		return value.filter((value) => value.id !== todo.id);
	});
	
};

const clearTodos = () => {
	_set([]);
};

export default { addTodo, removeTodo, clearTodos, subscribe };
