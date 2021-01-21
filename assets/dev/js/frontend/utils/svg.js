module.exports = {
	textToSVG: ( id, text = '', typography = { family: 'serif', weight: 'bold', transform: '', style: 'normal', decoration: 'normal' } ) => {
		const fontSize = 100;
		const width = text.length * fontSize / 2 + fontSize * 1.5;
		const height = fontSize * 1.5;

		let svg = `
			<svg width="${ width }" height="${ height }" xmlns="http://www.w3.org/2000/svg" style="position: absolute; z-index: -1000; left: -1000%; top: -1000%;">
				<link rel="stylesheet" href='https://fonts.googleapis.com/css2?family=${ typography.family }:wght@${ typography.weight }' />
				<style>
					text {
						font-size: ${ fontSize }px;
						font-family: ${ typography.family };
						font-weight: ${ typography.weight };
						font-style: ${ typography.style };
						text-transform: ${ typography.transform };
						text-decoration: ${ typography.decoration };
						fill: #000;
					}
				</style>
				<clipPath id="${ id }">
		            <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">${ text }</text>
		        </clipPath>
			</svg>
		`;

		return {
			toString: () => {
				return svg;
			},

			toBase64: () => {
				return 'data:image/svg+xml;base64,' + btoa( svg );
			},
		}
	},
};
