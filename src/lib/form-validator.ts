import type { ActionReturn } from 'svelte/action';
import type { ActionResult, SubmitFunction } from '@sveltejs/kit';
import { enhance } from '$app/forms';

import type { z, ZodType } from 'zod';

export type ErrorsType<T extends ZodType> = z.typeToFlattenedError<z.infer<T>>['fieldErrors'];

export type Options<TSchema extends ZodType> = {
	schema: TSchema;
};

export type ErrorEvent<TSchema extends ZodType> = {
	'on:submitclienterror': (e: CustomEvent<ErrorsType<TSchema>>) => void;
};

export type SubmitEvents<TSchema extends ZodType> = {
	'on:submitstarted'?: (e: CustomEvent<void>) => void;
	'on:submitended'?: (e: CustomEvent<void>) => void;
	'on:submitsucceeded'?: (
		e: CustomEvent<{ result: Record<string, any> | undefined; data: z.infer<TSchema> }>
	) => void;
};

export function validate<TSchema extends ZodType>(
	node: HTMLFormElement,
	options: Options<TSchema>
): ActionReturn<Options<TSchema>, ErrorEvent<TSchema>> {
	const formClientSideValidateHandler = async (event: SubmitEvent) => {
		if (!options) {
			return;
		}
		const errors = await getClientSideFormErrors(new FormData(node), options.schema);

		if (Object.keys(errors).length === 0) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();
		event.stopImmediatePropagation();
		node.dispatchEvent(new CustomEvent('submitclienterror', { detail: errors }));
	};

	node.addEventListener('submit', formClientSideValidateHandler);

	return {
		destroy() {
			node.removeEventListener('submit', formClientSideValidateHandler);
		}
	};
}

export function superEnhance<TSchema extends ZodType>(
	node: HTMLFormElement
): ActionReturn<Options<TSchema>, SubmitEvents<TSchema>>;
export function superEnhance<TSchema extends ZodType>(
	node: HTMLFormElement,
	options: { submit: SubmitFunction }
): ActionReturn<Options<TSchema>, SubmitEvents<TSchema>>;
export function superEnhance<TSchema extends ZodType>(
	node: HTMLFormElement,
	options: { validator: Options<TSchema> }
): ActionReturn<Options<TSchema>, SubmitEvents<TSchema> & ErrorEvent<TSchema>>;
export function superEnhance<TSchema extends ZodType>(
	node: HTMLFormElement,
	options: { validator: Options<TSchema> } & { submit: SubmitFunction }
): ActionReturn<Options<TSchema>, SubmitEvents<TSchema> & ErrorEvent<TSchema>>;
export function superEnhance<TSchema extends ZodType>(
	node: HTMLFormElement,
	options?: { submit?: SubmitFunction; validator?: Options<TSchema> }
) {
	const handleSubmit: SubmitFunction =
		options?.submit ||
		(({ formData }) => {
			node.dispatchEvent(
				new CustomEvent('submitstarted')
			);

			return async ({ update, result }) => {
				// TODO: CustomEvent<infer param of SubmitEvent<on:submitended>
				node.dispatchEvent(new CustomEvent('submitended'));
				await update();
				if (result.type == 'success') {
					node.dispatchEvent(
						new CustomEvent('submitsucceeded', {
							detail: {
								result: result.data,
								data: Object.fromEntries(formData) 
							}
						})
					);
				}
			};
		});

	const validatorReturn = options?.validator && validate(node, options.validator);
	const enhanceReturn = enhance(node, handleSubmit);

	return {
		destroy() {
			validatorReturn?.destroy && validatorReturn.destroy();
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
