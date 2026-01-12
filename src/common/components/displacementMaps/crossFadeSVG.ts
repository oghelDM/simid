export const image1 =
	"https://images.unsplash.com/photo-1682687982298-c7514a167088?auto=format&amp;fit=crop&amp;q=80&amp;w=2940&amp;ixlib=rb-4.0.3&amp;ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
export const image2 =
	"https://images.unsplash.com/photo-1697384333613-de519c7367c4?auto=format&amp;fit=crop&amp;q=80&amp;w=2942&amp;ixlib=rb-4.0.3&amp;ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
export const displacementImage = "images/displacementMap_ripples.png";
export const svgContent = `
<defs>
    <filter
      id="merge-filter"
      x="0%"
      y="0%"
      width="100%"
      height="100%"
      filterUnits="objectBoundingBox"
      primitiveUnits="userSpaceOnUse"
      color-interpolation-filters="sRGB"
    >
      <feimage
        href="${image2}"
        width="74%"
        height="74%"
        result="image2"
        preserveAspectRatio="xMidYMid slice"
      ></feimage>

      <feComposite
        in="image2"
        in2="SourceGraphic"
        operator="arithmetic"
        k1="0" 
        k2="0.5" 
        k3="0.5" 
        k4="0" 
        result="compositeImage"
      ></feComposite>
      
      <feimage
        href="${displacementImage}"
        id="displacement-image"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
        color-interpolation-filters="sRGB"
        result="distortionImage"
      ></feimage>
        
      <fedisplacementmap
        id="displacement-map"
        xChannelSelector="R"
        yChannelSelector="B"
        in="compositeImage"
        in2="distortionImage"
        result="displacedImage"
        color-interpolation-filters="sRGB"
        scale="219"
      ></fedisplacementmap>
    </filter>
  </defs>

  <image
    id="img-distorted"
    width="100%"
    height="100%"
    href="${image1}"
    filter="url(#merge-filter)"
    preserveAspectRatio="xMidYMid slice"
  ></image>
`;
