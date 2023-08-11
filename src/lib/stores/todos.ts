import { writable } from 'svelte/store';
import type { Todo } from '$lib/client/models/Todo';

const { set: _set, subscribe, update: _update } = writable<Todo[]>([]);

const addTodo = (todo: Todo): void => {
	_update((value) => {
		return [...value, todo];
	});
};

const removeTodo = (todo: Todo) => {
	_update((value) => {
		return value.filter((value) => value.id !== todo.id);
	});
};

const setTodos = (todos: Todo[]) => {
	_set(todos);
};

const clearTodos = () => {
	_set([]);
};

export default { addTodo, setTodos, removeTodo, clearTodos, subscribe };
