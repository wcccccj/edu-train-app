import { describe, it, expect } from 'vitest';
import { maskPhone, resolveLocation, formatStartTime } from './enrollment-display';
import dayjs from 'dayjs';

describe('maskPhone', () => {
	it('should mask the middle 4 digits of a valid 11-digit phone number', () => {
		expect(maskPhone('13812345678')).toBe('138****5678');
	});

	it('should return the original value for a non-11-digit phone', () => {
		expect(maskPhone('12345')).toBe('12345');
	});

	it('should return a placeholder for empty phone', () => {
		expect(maskPhone(undefined)).toBe('—');
		expect(maskPhone('')).toBe('—');
	});
});

describe('resolveLocation', () => {
	it('should show 线上 for online courses', () => {
		expect(resolveLocation('online', '')).toBe('线上');
	});

	it('should show the selected location for offline courses', () => {
		expect(resolveLocation('offline', '北京中心')).toBe('北京中心');
	});

	it('should return a placeholder when offline location is missing', () => {
		expect(resolveLocation('offline', undefined)).toBe('—');
	});
});

describe('formatStartTime', () => {
	it('should format a valid ISO start time to a readable local string', () => {
		const iso = '2026-09-01T09:00:00';
		expect(formatStartTime(iso)).toBe(dayjs(iso).format('YYYY-MM-DD HH:mm'));
	});

	it('should return a placeholder for missing or invalid start time', () => {
		expect(formatStartTime(undefined)).toBe('—');
		expect(formatStartTime('not-a-date')).toBe('—');
	});
});
