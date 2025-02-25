import process, { stderr, stdout } from 'node:process';
import { green } from 'picocolors';

export function log(message: string) {
	process.stdout.write(`${message}\n`);
}

export function error(message: string | Error) {
	const text = message instanceof Error ? (message.stack ?? message.message) : message;

	stderr.write(`error: ${text}\n`);
}

export function newline() {
	stdout.write('\n');
}

export function logAction(flag: string, message: string) {
	log(`${green('◼')}  ${green(flag)} ${message}`);
}
