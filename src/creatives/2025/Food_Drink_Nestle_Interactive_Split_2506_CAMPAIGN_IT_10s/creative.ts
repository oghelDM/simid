// import { VPAIDVideoPlayer } from "@app";
// import { Split } from "@/components/Split";
// import { Creative, CreativeProps } from "@/creative";

// class MyCreative extends Creative {
// 	constructor(root: HTMLElement, creativeProps: CreativeProps) {
// 		super(root, creativeProps);

// 		this.assetsPrefixUrl =
// 			"https://statics.dmcdn.net/d/PRODUCTION/2025/Food_Drink_Nestle_Interactive_Split_2506_CAMPAIGN_IT_10s/assets/";

// 		const split = new Split({
// 			id: "idxMngrDM",
// 			leftImageUrl: `${this.assetsPrefixUrl}bg0.png`,
// 			rightImageUrl: `${this.assetsPrefixUrl}bg1.png`,
// 			handleImageUrl: `${this.assetsPrefixUrl}split.png`,
// 			handleWidth: 97,
// 			debug: false,
// 			// originalPosition: 33,
// 			clickUrl:
// 				"https://ad.doubleclick.net/ddm/trackclk/N270801.132420DAILYMOTIONADVERTI/B33658840.424376793;dc_trk_aid=616848307;dc_trk_cid=237250351;dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;tfua=;gdpr=${GDPR};gdpr_consent=${GDPR_CONSENT_755};ltd=;dc_tdv=1",
// 			onClick: creativeProps.onClick,
// 		});
// 		root.appendChild(split);
// 	}
// }
// customElements.define("dm-creative", MyCreative);

// window.getVPAIDAd = () => new VPAIDVideoPlayer(MyCreative);
