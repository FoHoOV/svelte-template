import type { ActionReturn } from 'svelte/action';
import type { SubmitFunction } from '@sveltejs/kit';
import { enhance } from '$app/forms';

import type { z, ZodType } from 'zod';
import { validate, type ValidatorErrorEvent, type ValidatorOptions } from './validator';

export type SubmitEvents<TSchema extends ZodType> = {
	'on:submitstarted'?: (e: CustomEvent<void>) => void;
	'on:submitended'?: (e: CustomEvent<void>) => void;
	'on:submitsucceeded'?: (
		e: CustomEvent<{ result: Record<string, any> | undefined; data: z.infer<TSchema> }>
	) => void;
};

export function superEnhance<TSchema extends ZodType>(
	node: HTMLFormElement
): ActionReturn<ValidatorOptions<TSchema>, SubmitEvents<TSchema>>;
export function superEnhance<TSchema extends ZodType>(
	node: HTMLFormElement,
	options: { submit: SubmitFunction }
): ActionReturn<ValidatorOptions<TSchema>, SubmitEvents<TSchema>>;
export function superEnhance<TSchema extends ZodType>(
	node: HTMLFormElement,
	options: { validator: ValidatorOptions<TSchema> }
): ActionReturn<ValidatorOptions<TSchema>, SubmitEvents<TSchema> & ValidatorErrorEvent<TSchema>>;
export function superEnhance<TSchema extends ZodType>(
	node: HTMLFormElement,
	options: { validator: ValidatorOptions<TSchema> } & { submit: SubmitFunction }
): ActionReturn<ValidatorOptions<TSchema>, SubmitEvents<TSchema> & ValidatorErrorEvent<TSchema>>;
export function superEnhance<TSchema extends ZodType>(
	node: HTMLFormElement,
	options?: { submit?: SubmitFunction; validator?: ValidatorOptions<TSchema> }
) {
	const handleSubmit: SubmitFunction =
		options?.submit ||
		(({ formData }) => {
			node.dispatchEvent(new CustomEvent('submitstarted'));

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
