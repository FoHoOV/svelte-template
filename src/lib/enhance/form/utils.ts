import { fail } from '@sveltejs/kit';
import type { NumberRange, ErrorMessage } from '$lib/utils/types';
import type { z } from 'zod';
import type { ValidatorErrorsType } from './validator';

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

export function getFormErrors<Schema extends z.ZodType, Form extends {data?: ValidatorErrorsType<Schema> | undefined, message?: string | undefined} | null>(form: Form){
	return {errors: form?.data, message: form?.message};
}

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
