export type Store = {
	latitude: string | number;
	longitude: string | number;
	[key: string]: string | number | undefined;
};

export const getClosestStore = (
	stores: Store[],
	callback: (store: Store) => void,
	onError: () => void
) => getClosestStores(stores, (stores) => callback(stores[0]), onError);

export const getClosestStores = (
	stores: Store[],
	callback: (sortedStores: Store[]) => void,
	onError: () => void
) => {
	const apiKey = "1535516b2c9c4df29c622e0e77d6ef7e";
	const apiUrl = `https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey}`;
	fetch(apiUrl)
		.then((response) => {
			if (!response.ok) {
				console.log("Network response was not ok.");
				onError();
			}
			return response.json();
		})
		.then((data) => {
			const latitude = parseFloat(data.latitude);
			const longitude = parseFloat(data.longitude);

			const sortedStores = getSortedStores(latitude, longitude, stores);

			callback(sortedStores);
		})
		.catch((error: string) => {
			onError();
			console.log("Error fetching geolocation data 2: ", error);
		});
};

const getSortedStores = (
	latitude: number,
	longitude: number,
	stores: Store[]
): Store[] => {
	const tmpStores = stores.map((store) => ({
		...store,
		distanceToUser: getDistance(
			latitude,
			longitude,
			parseFloat(store.latitude.toString()),
			parseFloat(store.longitude.toString())
		),
	}));

	return tmpStores.sort(
		(sotre1, store2) => sotre1.distanceToUser - store2.distanceToUser
	);
};

// calculate distance between two coordinates using Haversine formula
const getDistance = (
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number
) => {
	const R = 6371; // Radius of the Earth in km
	const dLat = (lat2 - lat1) * (Math.PI / 180);
	const dLon = (lon2 - lon1) * (Math.PI / 180);
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(lat1 * (Math.PI / 180)) *
			Math.cos(lat2 * (Math.PI / 180)) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	const distance = R * c;
	return distance;
};
