export const messages = {
	creatingConfig: 'Creating Stylelint configuration file...',
	configExistsInPackageJson:
		"A Stylelint configuration is already defined in your project's `package.json` file.",
	configExists: (basename: string) =>
		`A Stylelint configuration file named "${basename}" already exists in this project.`,
	removeAndTryAgain: 'Please remove the existing configuration file and try again.',
	failedToCreateConfig: 'Failed to create the Stylelint configuration file.',
	createdConfig: (file: string) => `Successfully created the Stylelint configuration file: ${file}`,
	packageJsonNotFoundWarning: (pkgManager: string) =>
		`No \`package.json\` file was found in the current directory. The tool will attempt to create one using \`${pkgManager} init\`.`,
	creatingPackageJson: 'Creating a `package.json` file...',
	createdPackageJsonFile: 'Successfully created `package.json`.',
	failedToCreatePackageJson: 'Failed to create `package.json`.',
	installingPackages: 'Installing the necessary Stylelint packages...',
	failedToInstallPackages: 'Failed to install the packages.',
	installedPackages: 'Successfully installed the required Stylelint packages.',
	lintCommandRecommendation:
		'You can now lint your CSS files by running the command:\nnpx stylelint "**/*.css"',
	customizationRecommendation:
		'Please refer to the official Stylelint documentation for more customization options:\nhttps://stylelint.io/user-guide/customize/',
	installDependenciesConfirmation: (pkgManager: string, 
		dependencies: string[]) =>
		`The following dependencies will be installed using ${pkgManager}:\n\n  ${dependencies.join(
			'\n  ',
		)}\n\nWould you like to proceed with the installation?`,
};
