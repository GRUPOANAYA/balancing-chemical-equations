// Copyright 2014-2015, University of Colorado Boulder

/**
 * The 'Introduction' Screen
 *
 * @author Vasily Shakhov (mlearner.com)
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var AtomNode = require( 'NITROGLYCERIN/nodes/AtomNode' );
  var balancingChemicalEquations = require( 'BALANCING_CHEMICAL_EQUATIONS/balancingChemicalEquations' );
  var BCEConstants = require( 'BALANCING_CHEMICAL_EQUATIONS/common/BCEConstants' );
  var Element = require( 'NITROGLYCERIN/Element' );
  var inherit = require( 'PHET_CORE/inherit' );
  var IntroductionModel = require( 'BALANCING_CHEMICAL_EQUATIONS/introduction/model/IntroductionModel' );
  var IntroductionScreenView = require( 'BALANCING_CHEMICAL_EQUATIONS/introduction/view/IntroductionScreenView' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Screen = require( 'JOIST/Screen' );
  var Shape = require( 'KITE/Shape' );
  var Text = require( 'SCENERY/nodes/Text' );

  // strings
  var screenIntroductionString = require( 'string!BALANCING_CHEMICAL_EQUATIONS/screen.introduction' );

  /**
   * @constructor
   */
  var IntroductionScreen = function() {

    var options = {
      name: screenIntroductionString,
      backgroundColorProperty: new Property( BCEConstants.INTRODUCTION_CANVAS_BACKGROUND ),
      homeScreenIcon: createScreenIcon()
    };

    Screen.call( this,
      function() { return new IntroductionModel(); },
      function( model ) { return new IntroductionScreenView( model ); },
      options );
  };

  balancingChemicalEquations.register( 'IntroductionScreen', IntroductionScreen );

  // creates the icon for this screen: an equation above a balance beam
  var createScreenIcon = function() {

    // background rectangle
    var width = Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width;
    var height = Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height;
    var background = new Rectangle( 0, 0, width, height, { fill: 'white' } );

    // equation: X + Y -> XY
    var textOptions = { font: new PhetFont( { size: 24, weight: 'bold' } ) };
    var xPlusYText = new Text( 'X + Y', textOptions );
    var xyText = new Text( 'XY', textOptions );
    var arrowLength = 25;
    var arrowNode = new ArrowNode( 0, 0, arrowLength, 0, { stroke: null, headWidth: 15 } );
    var equationNode = new Node( { children: [ xPlusYText, arrowNode, xyText ] } );
    var equationXSpacing = 5;
    arrowNode.left = xPlusYText.right + equationXSpacing;
    arrowNode.centerY = xPlusYText.centerY;
    xyText.left = arrowNode.right + equationXSpacing;

    // balance beam, in horizontal (balanced) orientation
    var beamNode = new Rectangle( 0, 0, equationNode.width, 10, { fill: 'yellow', stroke: 'black', lineWidth: 0.25 } );
    beamNode.left = equationNode.left;
    beamNode.top = equationNode.bottom + 25;

    // fulcrum, centered below balance beam
    var fulcrumWidth = 0.25 * beamNode.width;
    var fulcrumHeight = 20;
    var fulcrumFill = new LinearGradient( 0, 0, 0, fulcrumHeight ).addColorStop( 0, 'white' ).addColorStop( 1, 'rgb(192, 192, 192)' );
    var fulcrumNode = new Path( new Shape().moveTo( 0, 0 ).lineTo( fulcrumWidth / 2, fulcrumHeight ).lineTo( -fulcrumWidth / 2, fulcrumHeight ).close(),
      { fill: fulcrumFill, stroke: 'black', lineWidth: 0.25 } );
    fulcrumNode.centerX = beamNode.centerX;
    fulcrumNode.top = beamNode.bottom;

    // atoms, left to right (this is brute force, but is unlikely to change)
    var atomsXMargin = 10;
    var atom1 = new AtomNode( Element.O );
    var atom2 = new AtomNode( Element.O );
    var atom3 = new AtomNode( Element.O );
    var atom4 = new AtomNode( Element.O );
    // all atoms are on top of the beam
    atom1.bottom = atom2.bottom = atom3.bottom = atom4.bottom = beamNode.top;
    // atoms on the left of the beam
    atom1.left = beamNode.left + atomsXMargin;
    atom2.left = atom1.right;
    // atom on the right of the beam
    atom4.right = beamNode.right - atomsXMargin;
    atom3.right = atom4.left;

    // scale to fit, center in background
    var contentNode = new Node( { children: [ equationNode, beamNode, fulcrumNode, atom1, atom2, atom3, atom4 ] } );
    contentNode.setScaleMagnitude( Math.min( 0.82 * background.width / contentNode.width, 0.82 * background.height / contentNode.height ) );
    contentNode.center = background.center;

    return new Node( { children: [ background, contentNode ] } );
  };

  return inherit( Screen, IntroductionScreen );
} );