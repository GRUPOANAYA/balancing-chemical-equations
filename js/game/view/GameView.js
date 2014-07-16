// Copyright 2002-2014, University of Colorado Boulder

/**
 * Scene graph for the 'Balancing game' screen.
 *
 * @author Vasily Shakhov (MLearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var GameAudioPlayer = require( 'VEGAS/GameAudioPlayer' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var BoxesNode = require( 'BALANCING_CHEMICAL_EQUATIONS/common/view/BoxesNode' );
  var EquationNode = require( 'BALANCING_CHEMICAL_EQUATIONS/common/view/EquationNode' );
  var BCEConstants = require( 'BALANCING_CHEMICAL_EQUATIONS/common/BCEConstants' );
  var ScoreboardBar = require( 'VEGAS/ScoreboardBar' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var HorizontalAligner = require( 'BALANCING_CHEMICAL_EQUATIONS/common/view/HorizontalAligner' );
  var TextPushButton = require( 'SUN/buttons/TextPushButton' );
  var GameFeedbackDialog = require( 'BALANCING_CHEMICAL_EQUATIONS/game/view/GameFeedbackDialog' );
  var LevelSelectionNode = require( 'BALANCING_CHEMICAL_EQUATIONS/game/view/LevelSelectionNode' );
  var BCERewardNode = require( 'BALANCING_CHEMICAL_EQUATIONS/game/view/BCERewardNode' );
  var LevelCompletedNode = require( 'VEGAS/LevelCompletedNode' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Text = require( 'SCENERY/nodes/Text' );
  var BCEQueryParameters = require( 'BALANCING_CHEMICAL_EQUATIONS/common/BCEQueryParameters' );
  var PropertySet = require( 'AXON/PropertySet' );

  // strings
  var checkString = require( 'string!BALANCING_CHEMICAL_EQUATIONS/check' );
  var nextString = require( 'string!BALANCING_CHEMICAL_EQUATIONS/next' );

  // Constants
  var BOX_SIZE = new Dimension2( 285, 340 );
  var BOX_X_SPACING = 140; // horizontal spacing between boxes

  /**
   * @param {GameModel} model
   * @constructor
   */
  function GameView( model ) {

    var self = this;
    ScreenView.call( this, {renderer: BCEConstants.RENDERER} );

    this.viewProperties = new PropertySet( {
      soundEnabled: true,
      timerEnabled: false,
      reactantsBoxExpanded: true,
      productsBoxExpanded: true
    } );

    this.model = model;
    this.audioPlayer = new GameAudioPlayer( this.viewProperties.soundEnabledProperty );
    this.aligner = new HorizontalAligner( this.layoutBounds.width, BOX_SIZE.width, BOX_X_SPACING );
    this.feedbackDialog = null; // feedback dialog, tells user how they did on a challenge

    // Add a root node where all of the game-related nodes will live.
    this.rootNode = new Node();
    this.addChild( this.rootNode );

    // level-selection interface
    this.levelSelectionNode = new LevelSelectionNode( this.model, this.viewProperties, this.layoutBounds, { visible: false } );
    this.rootNode.addChild( this.levelSelectionNode );

    // game-play interface, all the UI elements for a challenge
    this.gamePlayNode = new Node( { visible: false } );
    this.rootNode.addChild( this.gamePlayNode );

    // Scoreboard bar at the top of the screen
    var scoreboard = new ScoreboardBar(
      this.layoutBounds.width,
      model.currentEquationIndexProperty,
      model.numberOfEquationsProperty,
      model.levelProperty,
      model.pointsProperty,
      model.timer.elapsedTimeProperty,
      this.viewProperties.timerEnabledProperty,
      self.model.newGame.bind( self.model ),
      {
        font: new PhetFont( 14 ),
        yMargin: 5,
        leftMargin: 30,
        rightMargin: 30,
        centerX: this.layoutBounds.centerX,
        top: this.layoutBounds.top
      }
    );
    this.gamePlayNode.addChild( scoreboard );

    // boxes that show molecules corresponding to the equation coefficients
    this.boxesNode = new BoxesNode( model.currentEquationProperty, model.COEFFICENTS_RANGE, this.aligner,
      BOX_SIZE, BCEConstants.BOX_COLOR, this.viewProperties.reactantsBoxExpandedProperty, this.viewProperties.productsBoxExpandedProperty,
      { y: scoreboard.bottom + 15 } );
    this.gamePlayNode.addChild( this.boxesNode );

    // Equation
    this.equationNode = new EquationNode( this.model.currentEquationProperty, this.model.COEFFICENTS_RANGE, this.aligner );
    this.gamePlayNode.addChild( this.equationNode );
    this.equationNode.centerY = this.layoutBounds.height - ( this.layoutBounds.height - this.boxesNode.bottom ) / 2;

    // buttons: Check, Next, Try Again, Show Answer
    var BUTTONS_OPTIONS = {
      baseColor: 'yellow',
      centerX: 0,
      bottom: this.boxesNode.bottom
    };
    this.checkButton = new TextPushButton( checkString, _.extend( BUTTONS_OPTIONS, {
      listener: function() {
        self.playGuessAudio();
        self.model.check();
      }
    } ) );
    this.nextButton = new TextPushButton( nextString, _.extend( BUTTONS_OPTIONS, {
      listener: function() {
        self.model.next();
      }
    } ) );

    // scale buttons uniformly to fit the horizontal space between the boxes, see issue #68
    var buttonsParent = new Node( { children: [ this.checkButton, this.nextButton ] } );
    buttonsParent.setScaleMagnitude( Math.min( 1, 0.85 * BOX_X_SPACING / buttonsParent.width ) );
    buttonsParent.centerX = this.layoutBounds.centerX;
    buttonsParent.bottom = this.boxesNode.bottom;
    this.gamePlayNode.addChild( buttonsParent );

    // Monitor the game state and update the view accordingly.
    model.stateProperty.link( function( state ) {

      // interactivity enabled only when the 'Check' button is visible
      self.equationNode.pickable = ( state === self.model.states.CHECK );

      // call an initializer to setup the game for the state
      var states = model.states;
      switch( state ) {
        case states.LEVEL_SELECTION:
          self.initLevelSelection();
          break;
        case states.START_GAME:
          self.initStartGame();
          break;
        case states.CHECK:
          self.initCheck();
          break;
        case states.TRY_AGAIN:
          self.initTryAgain();
          break;
        case states.SHOW_ANSWER:
          self.initShowAnswer();
          break;
        case states.NEXT:
          self.initNext();
          break;
        case states.LEVEL_COMPLETED:
          self.initLevelCompleted();
          break;
        default:
          throw new Error( 'unsupported state: ' + state );
      }
    } );

    // Disable 'Check' button when all coefficients are zero.
    var coefficientsSumObserver = function( coefficientsSum ) {
      self.checkButton.enabled = ( coefficientsSum > 0 );
    };
    model.currentEquationProperty.link( function( newEquation, oldEquation ) {
      if ( oldEquation ) { oldEquation.coefficientsSumProperty.unlink( coefficientsSumObserver ); }
      if ( newEquation ) { newEquation.coefficientsSumProperty.link( coefficientsSumObserver ); }
    } );

    if ( BCEQueryParameters.DEV ) {

      // display correct coefficient at bottom center of the screen
      var answerNode = new Text( '', { font: new PhetFont( 12 ), bottom: this.layoutBounds.bottom - 5 } );
      this.gamePlayNode.addChild( answerNode );
      this.model.currentEquationProperty.link( function( equation ) {
        answerNode.text = equation.getCoefficientsString();
        answerNode.centerX = self.layoutBounds.centerX;
      } );

      // skips the current equation
      var skipButton = new TextPushButton( 'Skip', {
        font: new PhetFont( 10 ),
        baseColor: 'red',
        textFill: 'white',
        listener: model.next.bind( model ), // equivalent to 'Next'
        left: this.layoutBounds.left + 4,
        bottom: this.layoutBounds.bottom - 2
      } );
      this.gamePlayNode.addChild( skipButton );
    }
  }

  return inherit( ScreenView, GameView, {

    step: function( dt ) {
      if ( this.rewardNode ) {
        this.rewardNode.step( dt );
      }
    },

    initLevelSelection: function() {
      this.gamePlayNode.visible = false;
      this.levelSelectionNode.visible = true;
    },

    initStartGame: function() {
      this.viewProperties.reactantsBoxExpandedProperty.reset();
      this.viewProperties.productsBoxExpandedProperty.reset();
      this.levelSelectionNode.visible = false;
      this.gamePlayNode.visible = true;
      this.model.startGame();
    },

    initCheck: function() {
      this.checkButton.visible = true;
      this.nextButton.visible = false;
      this.setFeedbackDialogVisible( false );
      this.setBalancedHighlightEnabled( false );
    },

    initTryAgain: function() {
      this.checkButton.visible = false;
      this.setFeedbackDialogVisible( true );
    },

    initShowAnswer: function() {
      this.checkButton.visible = false;
      this.setFeedbackDialogVisible( true );
    },

    initNext: function() {
      var correct = this.model.currentEquation.balancedAndSimplified;
      this.nextButton.visible = ( !correct );
      this.checkButton.visible = false;
      this.setFeedbackDialogVisible( correct );
      this.setBalancedHighlightEnabled( true );
      this.model.currentEquation.balance(); // show the correct answer
    },

    initLevelCompleted: function() {
      var self = this;

      this.levelSelectionNode.visible = this.gamePlayNode.visible = false;

      // game reward, shown for perfect score (or with 'reward' query parameter)
      if ( this.model.isPerfectScore() || BCEQueryParameters.REWARD ) {
        this.rewardNode = new BCERewardNode( this.model.level );
        this.rootNode.addChild( this.rewardNode );
      }

      // bestTime on level, must be null to not show in popup
      var bestTimeOnThisLevel = this.model.bestTimes[ this.model.level ].get() === 0 ? null : this.model.bestTimes[ this.model.level ].get();

      // Add the dialog node that indicates that the level has been completed.
      var numberOfEquations = this.model.getNumberOfEquations( this.model.level );
      var levelCompletedNode = new LevelCompletedNode( this.model.level, this.model.points, this.model.getPerfectScore( this.model.level ),
        numberOfEquations, this.model.timerEnabled, this.model.timer.elapsedTime, bestTimeOnThisLevel, this.model.isNewBestTime,
        // function called when 'Continue' button is pressed
        function() {
          // remove the reward, if we have one
          if ( self.rewardNode ) {
            self.rootNode.removeChild( self.rewardNode );
            self.rewardNode = null;
          }
          // remove the level-completed dialog
          self.rootNode.removeChild( levelCompletedNode );
          // go back to the level-selection screen
          self.model.state = self.model.states.LEVEL_SELECTION;
        },
        {
          // LevelCompletedNode options
          starDiameter: Math.min( 60, 300 / numberOfEquations ),
          centerX: this.layoutBounds.centerX,
          centerY: this.layoutBounds.centerY,
          levelVisible: false
        }
      );
      this.rootNode.addChild( levelCompletedNode );

      // Play the appropriate audio feedback.
      if ( this.model.isPerfectScore() ) {
        this.audioPlayer.gameOverPerfectScore();
      }
      else {
        this.audioPlayer.gameOverImperfectScore();
      }
    },

    /*
     * Turns on/off the highlighting feature that indicates whether the equation is balanced.
     * We need to be able to control this so that a balanced equation doesn't highlight
     * until after the user presses the Check button.
     */
    setBalancedHighlightEnabled: function( enabled ) {
      this.equationNode.setBalancedHighlightEnabled( enabled );
      this.boxesNode.setBalancedHighlightEnabled( enabled );
    },

    playGuessAudio: function() {
      if ( this.model.currentEquation.balancedAndSimplified ) {
        this.audioPlayer.correctAnswer();
      }
      else {
        this.audioPlayer.wrongAnswer();
      }
    },

    /**
     * Controls the visibility of the game feedback dialog.
     * This tells the user whether their guess is correct or not.
     * @param visible
     */
    setFeedbackDialogVisible: function( visible ) {
      if ( this.feedbackDialog !== null ) {
        this.gamePlayNode.removeChild( this.feedbackDialog );
        this.feedbackDialog = null;
      }
      if ( visible ) {
        this.feedbackDialog = new GameFeedbackDialog( this.model, this.aligner,
          { centerX: this.layoutBounds.centerX, top: this.boxesNode.top + 10 } );
        this.gamePlayNode.addChild( this.feedbackDialog ); // visible and in front
      }
    }
  } );
} )
;
