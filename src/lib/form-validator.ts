import type { ActionReturn } from 'svelte/action';
import type { SubmitFunction } from '@sveltejs/kit';
import { enhance } from '$app/forms';

import type { z, ZodType } from 'zod';

export type ErrorsType<T extends ZodType> = z.typeToFlattenedError<z.infer<T>>['fieldErrors'];

export type Options<TSchema extends ZodType> = {
	validator: TSchema;
};

export type ErrorEvent<TSchema extends ZodType> = {
	'on:formclienterror': (e: CustomEvent<ErrorsType<TSchema>>) => void;
};

export type SubmitEvents = {
	'on:submitstarted'?: (e: CustomEvent<void>) => void;
	'on:submitended'?: (e: CustomEvent<void>) => void;
};

export function validate<TSchema extends ZodType>(
	node: HTMLFormElement,
	options: Options<TSchema>
): ActionReturn<Options<TSchema>, ErrorEvent<TSchema>> {
	const formClientSideValidateHandler = async (event: SubmitEvent) => {
		const errors = await getClientSideFormErrors(new FormData(node), options.validator);

		if (Object.keys(errors).length === 0) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();
		event.stopImmediatePropagation();
		node.dispatchEvent(new CustomEvent('formerror', { detail: errors }));
	};

	node.addEventListener('submit', formClientSideValidateHandler);

	return {
		destroy() {
			node.removeEventListener('submit', formClientSideValidateHandler);
		}
	};
}

export function customEnhance<TSchema extends ZodType>(
	node: HTMLFormElement,
	options: Options<TSchema> & { submit?: SubmitFunction }
): ActionReturn<Options<TSchema>, ErrorEvent<TSchema> & SubmitEvents> {
	const handleSubmit: SubmitFunction =
		options.submit ||
		(() => {
			node.dispatchEvent(new CustomEvent('submitstarted'));

			return async ({ update }) => {
				node.dispatchEvent(new CustomEvent('submitended'));
				await update();
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

export async function getClientSideFormErrors<TSchema extends ZodType>(
	formData: FormData,
	zodObject: ZodType
): Promise<ErrorsType<TSchema>> {
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
