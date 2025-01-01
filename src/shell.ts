import type { ChildProcess, StdioOptions } from 'node:child_process';
import { spawn } from 'node:child_process';
import { Readable } from 'node:stream';

export interface Options {
	cwd?: string | URL;
	stdio?: StdioOptions;
	timeout?: number;
}

export interface Output {
	stdout: string;
	stderr: string;
	exitCode: number;
}

const text = (stream: Readable | null) =>
	stream
		? new Promise<string>((resolve, reject) => {
				let data = '';
				stream.on('data', (chunk) => (data += chunk));
				stream.on('end', () => resolve(data.trimEnd()));
				stream.on('error', reject);
		  })
		: '';

export async function shell(command: string, flags: string[], opts: Options = {}): Promise<Output> {

	let child: ChildProcess;
	let stdout = '';
	let stderr = '';

	try {
		child = spawn(command, flags, {
			cwd: opts.cwd,
			shell: true,
			stdio: opts.stdio,
			timeout: opts.timeout,
		});

		const done = new Promise<void>((resolve) => {
			child.on('close', () => {
				resolve();
			});
		});

		[stdout, stderr] = await Promise.all([text(child.stdout), text(child.stderr)]);

		await done;
	} catch (error: unknown) {
		throw { stdout, stderr, exitCode: 1 };
	}

	const { exitCode } = child;
	if (exitCode === null) {
		throw new Error('Timeout');
	}

	if (exitCode !== 0) {
		throw new Error(`Command failed with exit code ${exitCode}:\n${stderr}`);
	}

	return { stdout, stderr, exitCode };
}
