export interface CreativeProps {
	videoSlot: HTMLVideoElement;
	onClick: (url: string) => void;
	stopAd: () => void;
	pauseAd: () => void;
	resumeAd: () => void;
	setAdVolume: (volume: number) => void;
	toggleVideo: (playVideo: boolean) => void;
	adParameters: string;
	isLumen?: boolean;
}
