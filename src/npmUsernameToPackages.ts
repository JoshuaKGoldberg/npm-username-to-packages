import { PackageData } from "./types.js";

interface ResponseBody {
	objects: ResponseResult[];
	time: string;
	total: number;
}

interface ResponseResult {
	flags: {
		insecure: number;
		unstable?: boolean;
	};
	package: PackageData;
	score: {
		detail: {
			maintenance: number;
			popularity: number;
			quality: number;
		};
		final: number;
	};
	searchScore: number;
}

export async function npmUsernameToPackages(maintainer: string) {
	const encodedMaintainer = encodeURIComponent(maintainer);
	const packages: PackageData[] = [];

	while (true) {
		const response = await fetch(
			`https://registry.npmjs.com/-/v1/search?from=${packages.length}&size=250&text=maintainer:${encodedMaintainer}`,
			{
				headers: { "Content-Type": "application/json" },
			},
		);
		const body = (await response.json()) as ResponseBody;

		packages.push(...body.objects.map((result) => result.package));

		if (packages.length >= body.total) {
			return packages;
		}
	}
}
