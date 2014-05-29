// Copyright 2002-2014, University of Colorado Boulder

/**
 * Displays a chemical equation.
 * Reactants are on the left-hand size, products are on the right-hand side.
 * When coefficients are editable, they are displayed as editable spinners.
 * When coefficients are not editable, they are displayed as PText.                                                                *
 *
 * @author Vasily Shakhov (mlearner.com)
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var RightArrowNode = require( 'BALANCING_CHEMICAL_EQUATIONS/common/view/RightArrowNode' );
  var TermNode = require( 'BALANCING_CHEMICAL_EQUATIONS/common/view/TermNode' );
  var PlusNode = require( 'SCENERY_PHET/PlusNode' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {Equation} equationProperty
   * @param {Array} coefficientRange node that will be used as the list's parent, use this to ensuring that the list is in front of everything else
   * @param {Object} options
   */

  function BalancedRepresentationChoiceNode( equationProperty, coefficientRange, aligner, options ) {
    var self = this;
    Node.call( this, options );

    this.coefficientRange = coefficientRange;
    this.balancedHighlightEnabled = true;
    this.aligner = aligner;
    this.equation = equationProperty;
    this.editable = true;
    this.termNodes = [];

    // arrow node, in a fixed location
    this.rightArrowNode = new RightArrowNode( equationProperty.balanced );
    this.addChild( this.rightArrowNode );
    this.rightArrowNode.centerX = this.aligner.centerXOffset;

    //TODO term alignment
    //the parent for all equation terms and the "+" signs
    this.termsParent = new Node();
    this.addChild( this.termsParent );

    //if coefficients changes
    var coefficientsObserver = function() {
      self.rightArrowNode.setHighlighted( self.equation.balanced && self.balancedHighlightEnabled );
    };

    // if the equation changes...
    equationProperty.link( function( newEquation, oldEquation ) {
      if ( oldEquation ) {
        oldEquation.balancedProperty.unlink( coefficientsObserver );
      }
      self.equation = newEquation;
      self.equation.balancedProperty.link( coefficientsObserver );
      self.updateNode();
    } );


  }

  return inherit( Node, BalancedRepresentationChoiceNode, {
    /*
     * Rebuilds the left and right sides of the equation.
                                                    */
                                                  updateNode: function() {
    this.termsParent.removeAllChildren();

    this.termNodes.forEach( function( termNode ) {
      termNode.cleanup();
    } );
    this.termNodes = [];

    this.updateSideOfEquation( this.equation.reactants, this.aligner.getReactantXOffsets( this.equation ) );
    this.updateSideOfEquation( this.equation.products, this.aligner.getProductXOffsets( this.equation ) );
  },
  /*
   * Updates one side of the equation.
   * This layout algorithm depends on the fact that all terms contain at least 1 capital letter.
   * This allows us to align the baselines of HTML-formatted text.
   */
  updateSideOfEquation: function( terms, xOffsets ) {
      var plusNode;
      var termNode;

      for ( var i = 0; i < terms.length; i++ ) {
        // term
        termNode = new TermNode( this.coefficientRange, terms[i], this.editable );
        this.termNodes.push( termNode );
        this.termsParent.addChild( termNode );
        termNode.centerX = xOffsets[i];

        if ( terms.length > 1 && i < terms.length - 1 ) {
          plusNode = new PlusNode();
          this.termsParent.addChild( plusNode );

          /*
           * Make sure that the term doesn't get too close to the plus sign.
           * If it does, then shift the plus sign a bit to the right.
           */
          var x = xOffsets[i] + ( ( xOffsets[i + 1] - xOffsets[i] ) / 2 ) - ( plusNode.width / 2 ); // centered between 2 offsets
          var minSeparation = 20;
          var separation = x - termNode.maxX;
          if ( separation < minSeparation ) {
            x += ( minSeparation - separation );
          }
          plusNode.x = x;
          plusNode.centerY = termNode.centerY;
        }
      }
      this.rightArrowNode.centerY = termNode.centerY;
    }
  } );
} );