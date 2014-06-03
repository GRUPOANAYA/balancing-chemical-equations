// Copyright 2002-2014, University of Colorado

/**
 * A bar that displays some number of atoms for a specified atom.
 * The bar is capable of displaying some maximum number of atoms.
 * If the number of atoms exceeds that maximum, then an upward-pointing
 * arrow appears at the top of the bar.
 * <p>
 * Origin is at the bottom center of the bar.
 *
 * @author Vasily Shakhov(mlearner.com)
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Text = require( 'SCENERY/nodes/Text' );
  var AtomNode = require( 'NITROGLYCERIN/nodes/AtomNode' );

  //constants
  var MAX_NUMBER_OF_ATOMS = 12;
  var MAX_BAR_SIZE = new Dimension2( 40, 60 );
  var STROKE = 1.5;
  var STROKE_COLOR = 'black';

  var BarNode = function( element, numberOfAtoms, options ) {
    this.element = element;
    this.numberOfAtoms = numberOfAtoms;

    //number
    var numberNode = new Text( String( this.numberOfAtoms ), {font: new PhetFont( 18 )} );

    var height = MAX_BAR_SIZE.height * ( this.numberOfAtoms / MAX_NUMBER_OF_ATOMS );
    //bar
    var bar = new Rectangle( 0, 0, MAX_BAR_SIZE.width, height, {
      fill: element.color,
      stroke: STROKE_COLOR,
      lineWidth: STROKE
    } );

    //symbol
    var symbolNode = new Text( element.symbol, {font: new PhetFont( 24 )} );

    //image
    var image = new AtomNode( element, 37 );

    //symbol and image
    var symbolHBox = new HBox( {children: [image, symbolNode], spacing: 3} );

    options = _.extend( {
      children: [numberNode, bar, symbolHBox]
    }, options );

    VBox.call( this, options );
    this.bottom = 0;

    /*// standard bar
     // icon
     PNode iconNode = new AtomNode( element );
     addChild( iconNode );

     // symbol
     HTMLNode symbolNode = new HTMLNode( element.getSymbol() );
     symbolNode.setFont( new PhetFont( 24 ) );
     addChild( symbolNode );

     // number
     PText numberNode = new PText( String.valueOf( numberOfAtoms ) );
     numberNode.setFont( new PhetFont( 18 ) );
     addChild( numberNode );

     // invisible node with constant width, this simplifies horizontal layout when arrow appears/disappears
     final double invisibleWidth = ARROW_SIZE.getWidth() + 10;
     PPath invisibleNode = new PPath( new Rectangle2D.Double( -invisibleWidth / 2, -1, invisibleWidth, 1 ) );
     invisibleNode.setStroke( STROKE );
     addChild( invisibleNode );
     invisibleNode.setVisible( false );

     // layout
     {
     // bar at origin
     double x = 0;
     double y = 0;
     barNode.setOffset( x, y );
     invisibleNode.setOffset( barNode.getOffset() );

     // symbol centered below bar
     x = invisibleNode.getFullBoundsReference().getCenterX();
     y = invisibleNode.getFullBoundsReference().getMaxY() + 4;
     symbolNode.setOffset( x, y );

     // icon to left of symbol
     x = invisibleNode.getFullBoundsReference().getCenterX() - ( iconNode.getFullBoundsReference().getWidth() / 2 ) - 4;
     if ( iconNode.getFullBoundsReference().getHeight() < symbolNode.getFullBoundsReference().getHeight() ) {
     y = symbolNode.getFullBoundsReference().getCenterY();
     }
     else {
     y = symbolNode.getFullBoundsReference().getMinY() + ( iconNode.getFullBoundsReference().getHeight() / 2 );
     }
     iconNode.setOffset( x, y );

     // number above bar
     x = invisibleNode.getFullBoundsReference().getCenterX() - ( numberNode.getFullBoundsReference().getWidth() / 2 );
     y = barNode.getFullBoundsReference().getMinY() - 4 - ( numberNode.getFullBoundsReference().getHeight() );
     numberNode.setOffset( x, y );
     barNode.setVisible( numberOfAtoms > 0 );
     }
     }*/

  };

  return inherit( VBox, BarNode );

} );