import picocolors from 'picocolors';
import process from 'node:process';

export function setupProcessHandlers(): void {
	process.on('SIGINT', () => {
		console.log('\n');
		console.log(picocolors.yellow('Operation cancelled by user.'));
		process.exit(0);
	});
}
