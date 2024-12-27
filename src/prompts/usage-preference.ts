import prompts from 'prompts';

export type UsagePreference = 'errors' | 'style';

export async function promptUsagePreference(): Promise<UsagePreference> {
	const { preference } = await prompts({
		type: 'select',
		name: 'preference',
		message: 'How would you like to use Stylelint?',
		choices: [
			{
				title: 'Catch errors only',
				description: 'Enforce only possible errors in your CSS',
				value: 'errors',
			},
			{
				title: 'Catch errors and enforce style',
				description: 'Enforce both possible errors and stylistic conventions',
				value: 'style',
			},
		],
		initial: 1,
	});

	return preference;
}
