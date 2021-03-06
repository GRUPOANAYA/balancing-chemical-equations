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

  var BCEQueryParameters = QueryStringMachine.getAll( {

    // shows answers, just below the reaction arrow in both screens
    showAnswers: { type: 'flag' },

    // play all challenges for each level of the game, to get 100% test coverage
    playAll: { type: 'flag' },

    // show the game reward regardless of score
    showReward: { type: 'flag' },

    // enables console logging
    log: { type: 'flag' }
  } );

  balancingChemicalEquations.register( 'BCEQueryParameters', BCEQueryParameters );

  return BCEQueryParameters;
} );
