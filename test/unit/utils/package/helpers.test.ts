import { describe, it, expect } from 'vitest';
import {
	getInitCommand,
	getLintCommand,
	getInstallCommand,
	PackageManager,
} from '../../../../src/utils/package/helpers';

describe('helpers', () => {
  describe('getInitCommand', () => {
    it('should return npm init command by default', () => {
      const result = getInitCommand()
      expect(result.command).toBe('npm init')
      expect(result.docs).toBe('https://docs.npmjs.com/cli/v11/commands/npm-init')
    })

    const packageManagers: PackageManager[] = ['npm', 'pnpm', 'yarn', 'bun']
    packageManagers.forEach(pm => {
      it(`should return correct init command for ${pm}`, () => {
        const result = getInitCommand(pm)
        expect(result.command).toBe(`${pm} init`)
        expect(result.docs).toBeTruthy() // Each PM should have docs URL
      })
    })
  })

  describe('getLintCommand', () => {
    it('should return npm lint command by default', () => {
      const result = getLintCommand()
      expect(result).toBe('npm run stylelint "**/*.css"')
    })

    const packageManagers: PackageManager[] = ['npm', 'pnpm', 'yarn', 'bun']
    packageManagers.forEach(pm => {
      it(`should return correct lint command for ${pm}`, () => {
        const result = getLintCommand(pm)
        expect(result).toBe(`${pm} run stylelint "**/*.css"`)
      })
    })
  })

  describe('getInstallCommand', () => {
    const testPackages = [
      { name: 'package1', version: '1.0.0' },
      { name: 'package2', version: '2.0.0' }
    ]

    it('should throw error for empty packages array', () => {
      expect(() => getInstallCommand('npm', [])).toThrow('Packages array is required')
    })

    it('should return npm install command by default', () => {
      const result = getInstallCommand(undefined, testPackages)
      expect(result).toBe('npm add -D package1@1.0.0 package2@2.0.0')
    })

    const packageManagers: PackageManager[] = ['npm', 'pnpm', 'yarn', 'bun']
    packageManagers.forEach(pm => {
      it(`should return correct install command for ${pm}`, () => {
        const result = getInstallCommand(pm, testPackages)
        expect(result).toBe(`${pm} add -D package1@1.0.0 package2@2.0.0`)
      })
    })

    it('should handle single package correctly', () => {
      const result = getInstallCommand('npm', [{ name: 'single', version: '1.0.0' }])
      expect(result).toBe('npm add -D single@1.0.0')
    })
  })
})
