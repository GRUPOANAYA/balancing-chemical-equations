// Copyright 2014-2015, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var balancingChemicalEquations = require( 'BALANCING_CHEMICAL_EQUATIONS/balancingChemicalEquations' );

  var getQueryParameter = phet.chipper.getQueryParameter;

  var BCEQueryParameters = {

    // enabled developer-only features
    DEV: getQueryParameter( 'dev' ) || false,

    // play all challenges for each level of the game, to get 100% test coverage
    PLAY_ALL: getQueryParameter( 'playAll' ) || false,

    // show the game reward regardless of score
    REWARD: getQueryParameter( 'reward' ) || false,

    // enables console output for debugging, particularly useful for the Game screen
    CONSOLE: getQueryParameter( 'console' ) || false
  };

  balancingChemicalEquations.register( 'BCEQueryParameters', BCEQueryParameters );

  return BCEQueryParameters;
} );
