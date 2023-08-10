import { z } from 'zod';

export const schema = z.object({
    title: z.string().nonempty().min(1),
	description: z.string().nonempty().min(1)
});
