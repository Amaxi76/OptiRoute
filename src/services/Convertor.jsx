const convertor = (inputContent, nbVehicules) => {
	const lines               = inputContent.split ( "\n" );
	const firstLine           = lines[0].trim ( ).split ( /\s+/ );
	const nbClients           = parseInt ( firstLine[0] );
	const nbSites             = nbClients + 1;
	const capaciteMaxVehicule = parseInt ( lines[1].trim ( ) );

	const depotLine = lines[2].trim ( ).split ( /\s+/ );
	const xDepot    = parseInt ( depotLine[0] );
	const yDepot    = parseInt ( depotLine[1] );

	const coordonnees = Array ( nbSites )
		.fill ( )
		.map ( ( ) => Array ( 2 ).fill ( 0 ) );
	const demandeCantine = Array ( nbSites ).fill ( 0 );

	coordonnees[0][0] = xDepot;
	coordonnees[0][1] = yDepot;

	for ( let i = 1; i < nbSites; i++ ) {
		const ligne = lines[i + 2].trim ( ).split ( /\s+/ );
		const index           = parseInt ( ligne[0] );
		coordonnees[index][0] = parseInt ( ligne[1] );
		coordonnees[index][1] = parseInt ( ligne[2] );
		demandeCantine[index] = parseInt ( ligne[3] );
	}

	const distances = Array ( nbSites )
		.fill ( )
		.map ( ( )  => Array ( nbSites ).fill ( 0 ) );
	for ( let i = 0; i < nbSites; i++ ) {
		for ( let j = 0; j < nbSites; j++ ) {
			if ( i === j ) {
			distances[i][j] = 0;
			} else {
			const dx = coordonnees[i][0] - coordonnees[j][0];
			const dy = coordonnees[i][1] - coordonnees[j][1];
			distances[i][j] = Math.sqrt ( dx * dx + dy * dy );
			}
		}
	}

	let output = "";
	output += `nbSites = ${nbSites};\n`;
	output += `nbVehicules = ${nbVehicules};\n`;
	output += `capaciteMaxVehicule = ${capaciteMaxVehicule};\n`;

	output += `demandeCantine = [`;
	output += demandeCantine.slice ( 1 ).join ( ", " );
	output += "];\n";

	output += `distances = [\n`;
	for ( let i = 0; i < nbSites; i++ ) {
		output += "  [";
		output += distances[i].map ( ( d ) => d.toFixed ( 3 ) ).join ( ", " );
		output += "]" + ( i < nbSites - 1 ? ",\n" : "\n" );
	}
	output += "];\n";

	return output;
};

	// Export the function as default
	export default convertor;