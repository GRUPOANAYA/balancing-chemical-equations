// Copyright 2002-2014, University of Colorado Boulder

/**
 * Indicator that an equation is not balanced, by any definition of balanced.
 * This looks like a dialog, and contains:
 * a frowny face
 * big 'X' for 'not balanced'
 * 'Show Why' button for showing an additional representation
 *
 * Author: Vasily Shakhov (mlearner.com)
 */

define( function( require ) {
  'use strict';

  //modules
  var inherit = require( 'PHET_CORE/inherit' );
  var GamePopupNode = require( 'BALANCING_CHEMICAL_EQUATIONS/game/view/popup/GamePopupNode' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var TextPushButton = require( 'SUN/buttons/TextPushButton' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Image = require( 'SCENERY/nodes/Image' );

  // strings
  var notBalancedString = require( 'string!BALANCING_CHEMICAL_EQUATIONS/notBalanced' );
  var showWhyString = require( 'string!BALANCING_CHEMICAL_EQUATIONS/showWhy' );

  // images
  var incorrectImage = require( 'image!BALANCING_CHEMICAL_EQUATIONS/Heavy-Ballot-X-u2718.png' );

  /**
   * Convenience constructor.
   *
   * @param whyButtonListener
   */
  var NotBalancedTerseNode = function( whyButtonListener ) {
    GamePopupNode.call( this, false, function( phetFont ) {

      // icon and text
      var hBox = new HBox( {
        children: [
          new Image( incorrectImage ),
          new Text( notBalancedString, {font: phetFont} )
        ],
        spacing: 0
      } );

      return new VBox( {
        children: [
          hBox,
          new TextPushButton( showWhyString, {  // "Show Why" button
            listener: whyButtonListener,
            baseColor: '#d9d9d9'
          } )
        ],
        spacing: 15
      } );
    } );
  };

  return inherit( GamePopupNode, NotBalancedTerseNode );

} );