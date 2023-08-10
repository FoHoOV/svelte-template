import { z } from 'zod';

export const schema = z.object({
	username: z.string().nonempty().min(5).max(10)
});
