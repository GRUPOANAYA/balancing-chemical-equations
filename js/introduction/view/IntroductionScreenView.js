// Copyright 2014-2015, University of Colorado Boulder

/**
 * Scene graph for the 'Introduction' screen.
 *
 * @author Vasily Shakhov (MLearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var balancingChemicalEquations = require( 'BALANCING_CHEMICAL_EQUATIONS/balancingChemicalEquations' );
  var BCEConstants = require( 'BALANCING_CHEMICAL_EQUATIONS/common/BCEConstants' );
  var BCEQueryParameters = require( 'BALANCING_CHEMICAL_EQUATIONS/common/BCEQueryParameters' );
  var BalanceScalesNode = require( 'BALANCING_CHEMICAL_EQUATIONS/common/view/BalanceScalesNode' );
  var BalancedRepresentation = require( 'BALANCING_CHEMICAL_EQUATIONS/common/model/BalancedRepresentation' );
  var BarChartsNode = require( 'BALANCING_CHEMICAL_EQUATIONS/common/view/BarChartsNode' );
  var BoxesNode = require( 'BALANCING_CHEMICAL_EQUATIONS/common/view/BoxesNode' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var EquationChoiceNode = require( 'BALANCING_CHEMICAL_EQUATIONS/introduction/view/EquationChoiceNode' );
  var EquationNode = require( 'BALANCING_CHEMICAL_EQUATIONS/common/view/EquationNode' );
  var FaceNode = require( 'SCENERY_PHET/FaceNode' );
  var HorizontalAligner = require( 'BALANCING_CHEMICAL_EQUATIONS/common/view/HorizontalAligner' );
  var inherit = require( 'PHET_CORE/inherit' );
  var IntroductionViewProperties = require( 'BALANCING_CHEMICAL_EQUATIONS/introduction/view/IntroductionViewProperties' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Text = require( 'SCENERY/nodes/Text' );
  var ToolsComboBox = require( 'BALANCING_CHEMICAL_EQUATIONS/introduction/view/ToolsComboBox' );

  // constants
  var BOX_SIZE = new Dimension2( 285, 145 );
  var BOX_X_SPACING = 110; // horizontal spacing between boxes

  /**
   * @param {IntroductionModel} model
   * @constructor
   */
  function IntroductionScreenView( model ) {

    var self = this;
    ScreenView.call( this, BCEConstants.SCREEN_VIEW_OPTIONS );

    // view-specific Properties
    var viewProperties = new IntroductionViewProperties();

    // aligner for equation
    var aligner = new HorizontalAligner( this.layoutBounds.width, BOX_SIZE.width, BOX_X_SPACING );

    // boxes that show molecules corresponding to the equation coefficients
    var boxesNode = new BoxesNode( model.equationProperty, model.COEFFICENTS_RANGE, aligner,
      BOX_SIZE, BCEConstants.BOX_COLOR, viewProperties.reactantsBoxExpandedProperty, viewProperties.productsBoxExpandedProperty,
      { top: 180 } );
    this.addChild( boxesNode );

    // 'Tools' combo box, at upper-right
    var comboBoxParent = new Node();
    this.addChild( new ToolsComboBox( viewProperties.balancedRepresentationProperty, comboBoxParent,
      { right: this.layoutBounds.right - 45, top: this.layoutBounds.top + 15 } ) );

    // smiley face, top center, shown when equation is balanced
    var faceNode = new FaceNode( 70, { centerX: this.layoutBounds.centerX, top: 15 } );
    this.addChild( faceNode );
    var updateFace = function() {
      faceNode.visible = model.equationProperty.get().balancedProperty.get();
    };
    model.equationProperty.link( function( newEquation, oldEquation ) {
      if ( oldEquation ) { oldEquation.balancedProperty.unlink( updateFace ); }
      newEquation.balancedProperty.link( updateFace );
    } );

    // interactive equation
    this.addChild( new EquationNode( model.equationProperty, model.COEFFICENTS_RANGE, aligner, { top: boxesNode.bottom + 20 } ) );

    // control for choosing an equation
    var equationChoiceNode = new EquationChoiceNode( this.layoutBounds.width, model.equationProperty, model.choices, { bottom: this.layoutBounds.bottom - 10 } );
    this.addChild( equationChoiceNode );

    // Reset All button
    this.addChild( new ResetAllButton( {
      listener: function() {
        model.reset();
        viewProperties.reset();
      },
      right: this.layoutBounds.right - 20,
      centerY: equationChoiceNode.centerY,
      scale: 0.8
    } ) );

    // Show the selected 'balanced' representation, create nodes on demand.
    var balancedParent = new Node(); // to maintain rendering order for combo box
    this.addChild( balancedParent );
    var barChartsNode;
    var balanceScalesNode;
    viewProperties.balancedRepresentationProperty.link( function( balancedRepresentation ) {

      // bar chart
      if ( !barChartsNode && balancedRepresentation === BalancedRepresentation.BAR_CHARTS ) {
        barChartsNode = new BarChartsNode( model.equationProperty, aligner, {
          bottom: boxesNode.top - 10
        } );
        balancedParent.addChild( barChartsNode );
      }
      if ( barChartsNode ) {
        barChartsNode.visible = ( balancedRepresentation === BalancedRepresentation.BAR_CHARTS );
      }

      // balance scales
      if ( !balanceScalesNode && balancedRepresentation === BalancedRepresentation.BALANCE_SCALES ) {
        balanceScalesNode = new BalanceScalesNode( model.equationProperty, aligner,
          { bottom: boxesNode.top - 10, dualFulcrumSpacing: 325 } );  // use special spacing for 2 fulcrums, see issue #91
        balancedParent.addChild( balanceScalesNode );
      }
      if ( balanceScalesNode ) {
        balanceScalesNode.visible = ( balancedRepresentation === BalancedRepresentation.BALANCE_SCALES );
      }
    } );

    // add this last, so that combo box list is on top of everything else
    this.addChild( comboBoxParent );

    // show the answer when running in dev mode, bottom center
    if ( BCEQueryParameters.showAnswers ) {
      var answerNode = new Text( '', { font: new PhetFont( 12 ), bottom: equationChoiceNode.top - 5 } );
      this.addChild( answerNode );
      model.equationProperty.link( function( equation ) {
        answerNode.text = equation.getCoefficientsString();
        answerNode.centerX = self.layoutBounds.centerX;
      } );
    }
  }

  balancingChemicalEquations.register( 'IntroductionScreenView', IntroductionScreenView );

  return inherit( ScreenView, IntroductionScreenView );
} );
