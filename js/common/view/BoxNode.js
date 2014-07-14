// Copyright 2002-2014, University of Colorado Boulder

/**
 * A pair of boxes that show the number of molecules indicated by the equation's user coefficients.
 * Left box is for the reactants, right box is for the products.
 *
 * @author Vasily Shakhov (mlearner.com)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ExpandCollapseButton = require( 'SUN/ExpandCollapseButton' );
  var Shape = require( 'KITE/Shape' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Vector2 = require( 'DOT/Vector2' );
  var BCEConstants = require( 'BALANCING_CHEMICAL_EQUATIONS/common/BCEConstants' );

  //constants
  var TITLE_FONT = new PhetFont( 18 );

  /**
   * @param {DOT.Range} coefficientRange range of the coefficients
   * @param {Property} openProperty is Box open property
   * @param {Object} options
   * @constructor
   */
  function BoxNode( coefficientRange, openProperty, options ) {

    var self = this;
    this.coefficientRange = coefficientRange;

    Node.call( this, options );

    //box options
    options = _.extend( {
      buttonLength: 15,
      xMargin: 5,
      yMargin: 5,
      fill: 'white',
      stroke: 'black',
      lineWidth: 1,
      title: '',
      boxWidth: 100,
      boxHeight: 100
    }, options );

    this.boxHeight = options.boxHeight;

    // title
    this.titleNode = new Rectangle( 0, 0, options.boxWidth, options.buttonLength + 2 * options.yMargin, {fill: options.fill, lineWidth: options.lineWidth, stroke: options.stroke} );
    this.addChild( this.titleNode );
    this.titleNode.addChild( new Text( options.title, {
      font: TITLE_FONT,
      fontWeight: 'bold',
      centerY: this.titleNode.centerY,
      centerX: this.titleNode.centerX
    } ) );

    // content
    this.contentNode = new Rectangle( 0, 0, options.boxWidth, options.boxHeight, {fill: options.fill, lineWidth: options.lineWidth, stroke: options.stroke} );
    this.addChild( this.contentNode );

    // expand/collapse button
    var button = new ExpandCollapseButton( options.buttonLength, openProperty );
    button.touchArea = Shape.bounds( button.localBounds.dilatedXY( 10, 10 ) );
    this.addChild( button );
    button.right = this.width - options.xMargin;
    button.y = options.yMargin;

    // show/hide title and contentNode
    openProperty.link( function( isOpen ) {
      self.titleNode.setVisible( !isOpen );
      self.contentNode.setVisible( isOpen );
    } );
  }

  return inherit( Node, BoxNode, {

    /**
     * Creates molecules in the boxes for one set of terms (reactants or products).
     * @param {EquationTerm} terms array
     * @param {Number} xOffsets array of offsets for terms
     */
    createMolecules: function( terms, xOffsets ) {
      var moleculeNodes; //array of all molecule images for every term
      this.termNodes = {}; //contains moleculeNodes with key term.molecule.symbol
      this.contentNode.removeAllChildren();
      var yMargin = 0;
      var rowHeight = ( this.boxHeight - ( 2 * yMargin ) ) / this.coefficientRange.max;

      for ( var i = 0; i < terms.length; i++ ) {
        moleculeNodes = [];
        var MoleculeNodeConstructor = terms[i].molecule.nodeConstructor;
        var y = this.boxHeight - yMargin - ( rowHeight / 2 );
        for ( var j = 0; j < this.coefficientRange.max; j++ ) {
          var moleculeNode = new MoleculeNodeConstructor( BCEConstants.ATOM_OPTIONS );
          moleculeNode.scale( BCEConstants.MOLECULE_SCALE_FACTOR );
          this.contentNode.addChild( moleculeNode );
          moleculeNode.center = new Vector2( xOffsets[i] - this.x, y );
          y -= rowHeight;
          moleculeNodes.push( moleculeNode );
        }

        this.termNodes[terms[i].molecule.symbol] = moleculeNodes;
      }
    },

    /**
     * Updates molecule visibility
     * @param {EquationTerm} terms array
     */
    updateMolecules: function( terms ) {
      var isVisible = function( moleculePosition, userCoefficient ) {
        return moleculePosition < userCoefficient;
      };

      for ( var i = 0; i < terms.length; i++ ) {
        var moleculeNodes = this.termNodes[terms[i].molecule.symbol];
        for ( var j = 0; j < this.coefficientRange.max; j++ ) {
          moleculeNodes[j].visible = isVisible( j, terms[i].userCoefficient );
        }
      }
    }
  } );
} );