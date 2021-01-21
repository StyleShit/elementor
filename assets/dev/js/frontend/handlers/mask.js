import { textToSVG } from '../utils/svg';

class Mask extends elementorModules.frontend.handlers.Base {
	onInit() {
		const prefix = '_mask_text';

		if( ! this.getElementSettings( prefix ) ) {
			this.$element[0].style = '';
			return;
		}

		const text = this.getElementSettings( prefix );
		const typography = {
			family: this.getElementSettings( `${ prefix }_font_family` ),
			weight: this.getElementSettings( `${ prefix }_font_weight` ),
			style: this.getElementSettings( `${ prefix }_font_style` ),
			transform: this.getElementSettings( `${ prefix }_text_transform` ),
			decoration: this.getElementSettings( `${ prefix }_text_decoration` ),
		};

		// console.log( textToSVG( text, typography ).toString() );
		// const base64 = textToSVG( text, typography ).toBase64();

		const id = this.$element[0].dataset.id;
		this.$element[0].innerHTML += textToSVG( id, text, typography ).toString();
		this.$element[0].style = `clip-path: url( #${ id } );`;
	}


	async injectSVG() {
		fetch( this.svgURL )
			.then( ( res ) => res.text() )
			.then( ( svg ) => {
				// Append temporary div with the SVG to the element.
				const tmpDiv = document.createElement( 'div' );
				tmpDiv.style.height = 0;
				tmpDiv.style.width = 0;
				tmpDiv.innerHTML = svg;

				this.$element[0].appendChild( tmpDiv );

				const svgElement = tmpDiv.querySelector( 'svg' );

				// Convert the svg to be clip-path compatible.
				this.reFormatSVG( svgElement );

				this.$element[0].querySelector( '.elementor-widget-container' ).style = `clip-path: url( #${ this.clipPathId } );`;

			} );
	}

	// Move all shape elements from svg to a clipPath element.
	reFormatSVG( svgElement ) {
		svgElement.setAttribute( 'width', '0' );
		svgElement.setAttribute( 'height', '0' );
		svgElement.removeAttribute( 'id' );

		const viewBox = svgElement.getAttribute( 'viewBox') || '0 0 1 1';
		const [ minX, minY, width, height ] = viewBox.split( ' ' );

		const shapeElements = svgElement.querySelectorAll( 'path, circle, ellipse, text, polygon, line, polyline ' );

		svgElement.innerHTML += `<defs><clipPath id="${ this.clipPathId }"></clipPath></defs>`;
		const clipPathElement = svgElement.querySelector( `#${ this.clipPathId }`);

		// Make any size fit the element.
		// Ref: https://css-tricks.com/scaling-svg-clipping-paths-css-use/
		clipPathElement.setAttribute( 'clipPathUnits', 'objectBoundingBox' );
		clipPathElement.setAttribute( 'transform', `scale( ${ 1 / width } ${ 1 / height } )` );

		shapeElements.forEach( ( el ) => {
			clipPathElement.appendChild( el );
		} );
	}
}

export default ( $scope ) => {
	elementorFrontend.elementsHandler.addHandler( Mask, { $element: $scope } );
};
