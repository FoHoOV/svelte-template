import { generate } from 'ts-to-zod';
import fs from 'fs';
import { join } from 'path';

// as of now(2023/8/18):
// if a.ts imports b.ts and uses an exported member of b in its type
// this tool will error out with message: "Some schemas can't be generated due to direct or indirect missing dependencies"
// so we will have to w8 or fix that ourselves :(

const CLIENT_MODELS_PATH = './src/lib/client/models';
const SCHEMA_PATHS = './src/lib/client/zod';

fs.mkdirSync(`${SCHEMA_PATHS}`, { recursive: true }, (err) => {
	if (err) throw err;
});

fs.readdir(
	CLIENT_MODELS_PATH,
	{
		withFileTypes: true
	},
	(err, files) => {
		if (err) {
			throw err;
		}

		files.forEach((file) => {
			const schemaGenerator = generate({
				sourceText: fs
					.readFileSync(join(CLIENT_MODELS_PATH, file.name), { encoding: 'utf-8' })
					.split(/\r?\n/)
					.slice(1)
					.join('\n'),
				inferredTypes: true
			});

			fs.writeFileSync(join(SCHEMA_PATHS, file.name), schemaGenerator.getZodSchemasFile(file));
		});
	}
);
