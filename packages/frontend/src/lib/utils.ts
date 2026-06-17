import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

export function hasEnvVar(key: string): boolean {
  return typeof process.env[key] !== 'undefined' && process.env[key] !== '';
}

export function validateEnvVar(key: string): string {
  const value = process.env[key];
  if (typeof value === 'undefined' || value === '') {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}
