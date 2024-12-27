import picocolors from 'picocolors';

export async function showNextSteps(): Promise<void> {
	console.log(`
${picocolors.green(
	'You can now lint your CSS files by running the command:\nnpx stylelint "**/*.css"',
)}

${picocolors.dim(
	'Please refer to the official Stylelint documentation for more customization options:\nhttps://stylelint.io/user-guide/customize/',
)}
        `);
}
