export const image =
	"https://images.unsplash.com/photo-1695605118408-b31785f23152?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwyNHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60";
export const displacementImage = "images/displacementMap_ripples.png";

export const svgContent = `
  <defs>
    <filter
      id="distortion-filter"
      x="0"
      y="0"
      width="100%"
      height="100%"
      filterUnits="objectBoundingBox"
      primitiveUnits="userSpaceOnUse"
      color-interpolation-filters="sRGB"
    >
      <feimage
        id="displacement-image"
        href="${displacementImage}"
        x="-8%"
        y="-8%"
        width="74%"
        height="74%"
        preserveAspectRatio="xMidYMid slice"
        color-interpolation-filters="sRGB"
        result="distortionImage"
      ></feimage>
      <fedisplacementmap
        id="displacement-map"
        xChannelSelector="R"
        yChannelSelector="B"
        in="SourceGraphic"
        in2="distortionImage"
        color-interpolation-filters="sRGB"
        scale="219"
      >
      </fedisplacementmap>
    </filter>
  </defs>
  <image
    id="img-distorted"
    preserveAspectRatio="xMidYMid slice"
    width="100%"
    height="100%"
    href="${image}"
    filter="url(#distortion-filter)"
  ></image>`;
