import { writable } from 'svelte/store';
import type { ZodObject, ZodRawShape, z } from 'zod';
import type { ActionReturn } from 'svelte/action';

export type ErrorsType<TSchema extends ZodRawShape> =  z.typeToFlattenedError<TSchema>['fieldErrors'];

export type Options<TSchema extends ZodRawShape> = {
	validator: ZodObject<TSchema>;
};

export type ErrorEvent<TSchema extends ZodRawShape> = {
	'on:formerror': (e: CustomEvent<ErrorsType<TSchema>>) => void;
};

export function validate<TSchema extends ZodRawShape>(
	node: HTMLFormElement,
	options: Options<TSchema>
): ActionReturn<Options<TSchema>, ErrorEvent<TSchema>> {
	const formErrors = writable<ErrorsType<TSchema>>({});

	const formValidateHandler = async (event: SubmitEvent) => {
		const errors = await getFormErrors(new FormData(node), options.validator);
		formErrors.set(errors);
		if (errors) {
			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation();
		}
	};

	// does not return a listener that we can remove later
	node.addEventListener('submit', formValidateHandler);

	const unsubscribe = formErrors.subscribe((value) => {
		value && node.dispatchEvent(new CustomEvent('formerror', { detail: value }));
	});

	return {
		destroy() {
			unsubscribe();
			node.removeEventListener('submit', formValidateHandler);
		}
	};
}

export async function getFormErrors<TSchema extends ZodRawShape>(
	formData: FormData,
	zodObject: ZodObject<TSchema>
) {
	const validationsResult = await zodObject.safeParseAsync(convertFormDataToObject(formData));
	if (validationsResult.success) {
		return {};
	} else {
		return validationsResult.error.flatten().fieldErrors;
	}
}

export function convertFormDataToObject(formData: FormData): Record<string, FormDataEntryValue> {
	const result: Record<string, FormDataEntryValue> = {};
	formData.forEach((value, key) => {
		result[key] = value;
	});
	return result;
}
