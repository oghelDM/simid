export const image =
	"https://images.unsplash.com/photo-1682687982298-c7514a167088?auto=format&amp;fit=crop&amp;q=80&amp;w=2940&amp;ixlib=rb-4.0.3&amp;ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

export const svgContent = `
  <defs>
    <filter id="water-filter">
      <feTurbulence
        id="feTurb"
        type="fractalNoise"
        baseFrequency="0.01 0.01"
        seed="7"
        numOctaves="2"
      />
      <animate
        xlink:href="#feTurb"
        attributeName="baseFrequency"
        dur="40s"
        keyTimes="0;0.5;1"
        values="0.008 0.015;0.015 0.008;0.008 0.015"
        repeatCount="indefinite"
      />
      <feDisplacementMap
        id="feDisp"
        in="SourceGraphic"
        scale="80"
      />
    </filter>
  </defs>
  <image
    id="img-distorted"
    preserveAspectRatio="xMidYMid slice"
    width="100%"
    height="100%"
    xlink:href="${image}"
    filter="url(#water-filter)"
  ></image>`;
