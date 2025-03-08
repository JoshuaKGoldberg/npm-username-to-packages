import { describe, expect, it, vi } from "vitest";

import { npmUsernameToPackages } from "./npmUsernameToPackages.js";

const mockFetch = vi.fn();

vi.stubGlobal("fetch", mockFetch);

function createPagination(packageNames: string[], total: number) {
	let calls = 0;

	return () => {
		const start = calls * 250;
		const end = (calls + 1) * 250;
		calls += 1;

		return {
			json: () => ({
				objects: packageNames.slice(start, end).map((responseName) => ({
					package: responseName,
				})),
				total,
			}),
		};
	};
}

describe("npmUsernameToPackages", () => {
	it("returns results when they are not paginated", async () => {
		const packageNames = ["abc", "def", "ghi"];

		mockFetch.mockResolvedValue({
			json: () => ({
				objects: packageNames.map((packageName) => ({ package: packageName })),
				total: 2,
			}),
		});

		const actual = await npmUsernameToPackages("maintainer");

		expect(actual).toEqual(packageNames);
	});

	it("returns results when they are paginated once", async () => {
		const total = 251;
		const packageNames = new Array(total).fill(undefined).map((_, i) => `${i}`);

		mockFetch.mockImplementation(createPagination(packageNames, total));

		const actual = await npmUsernameToPackages("maintainer");

		expect(actual).toEqual(packageNames);
	});

	it("returns results when they are paginated twice", async () => {
		const total = 501;
		const packageNames = new Array(total).fill(undefined).map((_, i) => `${i}`);

		mockFetch.mockImplementation(createPagination(packageNames, total));

		const actual = await npmUsernameToPackages("maintainer");

		expect(actual).toEqual(packageNames);
	});

	it("returns results when they are paginated many times", async () => {
		const total = 9001;
		const packageNames = new Array(total).fill(undefined).map((_, i) => `${i}`);

		mockFetch.mockImplementation(createPagination(packageNames, total));

		const actual = await npmUsernameToPackages("maintainer");

		expect(actual).toEqual(packageNames);
	});

	it("handle valid npm username without special characters", async () => {
		const packageNames = ["package1", "package2"];
		const username = "maintainer-test";
		const encodedUsername = encodeURIComponent(username);

		mockFetch.mockResolvedValue({
			json: () => ({
				objects: packageNames.map((packageName) => ({ package: packageName })),
				total: packageNames.length,
			}),
		});

		const actual = await npmUsernameToPackages(username);

		expect(actual).toEqual(packageNames);
		expect(mockFetch).toHaveBeenCalledWith(
			`https://registry.npmjs.com/-/v1/search?from=0&size=250&text=maintainer:${encodedUsername}`,
			{ headers: { "Content-Type": "application/json" } },
		);
	});

	it("handle invalid npm username with special characters", async () => {
		const username = "#JI*#@%OSJ";
		const encodedUsername = encodeURIComponent(username);

		mockFetch.mockResolvedValue({
			json: () => ({
				objects: [],
				total: 0,
			}),
		});

		const actual = await npmUsernameToPackages(username);

		expect(actual).toEqual([]);
		expect(mockFetch).toHaveBeenCalledWith(
			`https://registry.npmjs.com/-/v1/search?from=0&size=250&text=maintainer:${encodedUsername}`,
			{ headers: { "Content-Type": "application/json" } },
		);
	});
});
