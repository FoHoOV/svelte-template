import { fail } from '@sveltejs/kit';
import type { NumberRange, ErrorMessage } from '$lib/utils/types';

export function convertFormDataToObject(formData: FormData): Record<string, FormDataEntryValue> {
	const result: Record<string, FormDataEntryValue> = {};
	formData.forEach((value, key) => {
		result[key] = value;
	});
	return result;
}

export type FailedActionProps<T> = {
	message: ErrorMessage;
	data?: T;
};

export function failedActionData({ message }: FailedActionProps<undefined>): {
	message: ErrorMessage;
	data: undefined;
};
export function failedActionData<T>({ message, data }: FailedActionProps<T>): {
	message: ErrorMessage;
	data: T;
};
export function failedActionData<T>({ message, data }: FailedActionProps<T>) {
	return { message, data };
}

export function superFail<T = undefined>(
	status: NumberRange<400, 600>,
	{ message, data }: FailedActionProps<T>
) {
	return fail(status, failedActionData({ message, data }));
}
