import type { ZodObject, ZodRawShape, z } from 'zod';
import type { ActionReturn } from 'svelte/action';
import type { SubmitFunction } from '@sveltejs/kit';
import { enhance } from '$app/forms';
import { setContext } from 'svelte';

export type ErrorsType<TSchema extends ZodRawShape> =
	z.typeToFlattenedError<TSchema>['fieldErrors'];

export type Options<TSchema extends ZodRawShape> = {
	validator: ZodObject<TSchema>;
};

export type ErrorEvent<TSchema extends ZodRawShape> = {
	'on:formerror': (e: CustomEvent<ErrorsType<TSchema>>) => void;
};

export type SubmitEvents = {
	'on:submitstarted'?: (e: CustomEvent<void>) => void;
	'on:submitended'?: (e: CustomEvent<void>) => void;
};

export function validate<TSchema extends ZodRawShape>(
	node: HTMLFormElement,
	options: Options<TSchema>
): ActionReturn<Options<TSchema>, ErrorEvent<TSchema>> {
	const formValidateHandler = async (event: SubmitEvent) => {
		const errors = await getFormErrors(new FormData(node), options.validator);

		if (Object.keys(errors).length === 0) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();
		event.stopImmediatePropagation();
		node.dispatchEvent(new CustomEvent('formerror', { detail: errors }));
	};

	node.addEventListener('submit', formValidateHandler);

	return {
		destroy() {
			node.removeEventListener('submit', formValidateHandler);
		}
	};
}

export function customEnhance<TSchema extends ZodRawShape>(
	node: HTMLFormElement,
	options: Options<TSchema> & { submit?: SubmitFunction }
): ActionReturn<Options<TSchema>, ErrorEvent<TSchema> & SubmitEvents> {
	const handleSubmit: SubmitFunction =
		options.submit ||
		(() => {
			node.dispatchEvent(new CustomEvent("submitstarted"));

			return async ({ update }) => {
				await update();
				node.dispatchEvent(new CustomEvent("submitended"));
			};
		});

	const validatorReturn = validate(node, options);
	const enhanceReturn = enhance(node, handleSubmit);

	return {
		destroy() {
			validatorReturn.destroy && validatorReturn.destroy();
			enhanceReturn.destroy();
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
