export interface PackageAuthor {
	email?: string;
	name?: string;
	url?: string;
	username?: string;
}

export interface PackageLinks {
	bugs?: string;
	homepage?: string;
	npm: string;
	repository?: string;
}

export interface PackageMaintainer {
	email?: string;
	username?: string;
}

export interface PackagePublisher {
	email?: string;
	username?: string;
}

/**
 * @see https://github.com/npm/registry/blob/master/docs/REGISTRY-API.md#get-v1search
 */

export interface PackageData {
	author?: PackageAuthor;
	date: string;
	description: string;
	keywords: string[];
	links: PackageLinks;
	maintainers: PackageMaintainer[];
	name: string;
	publisher: PackagePublisher;
	scope: string;
	version: string;
}
