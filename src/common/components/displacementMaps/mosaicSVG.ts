export const image =
	"https://images.unsplash.com/photo-1682687982298-c7514a167088?auto=format&amp;fit=crop&amp;q=80&amp;w=2940&amp;ixlib=rb-4.0.3&amp;ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

export const svgContent = `
  <defs>
    <filter id="mosaic-filter" 
      x="0%"
      y="0%"
      width="100%"
      height="100%">
      <feFlood 
        width="2"
        height="2" 
      />
      <feComposite
        width="12"
        height="12"
      />
      <feTile result="a"/>
      <feComposite
        in="SourceGraphic"
        in2="a"
        operator="in"
      />
      <feMorphology
        operator="dilate"
        radius="6"
      />
    </filter>
  </defs>
  <image
    id="img-distorted"
    preserveAspectRatio="xMidYMid slice"
    width="100%"
    height="100%"
    xlink:href="${image}"
    filter="url(#mosaic-filter)"
  ></image>`;
