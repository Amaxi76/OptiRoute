function genererSolutionInitiale(demandeCantine, capaciteMaxVehicule, distances) {
	let solution = clarkeWrightSavings(demandeCantine, capaciteMaxVehicule, distances);
	return ameliorationLocale(solution,distances);
}

function clarkeWrightSavings(demandeCantine, capaciteMaxVehicule, distances) {
	const nbCantines = demandeCantine.length;
	let routes = Array.from({ length: nbCantines }, (_, i) => [i + 1]);

	// Mélanger les routes initiales
	routes = routes.sort(() => Math.random() - 0.5);

	let savings = [];

	for (let i = 1; i <= nbCantines; i++) {
		for (let j = i + 1; j <= nbCantines; j++) {
			let saving = distances[0][i] + distances[0][j] - distances[i][j]; // Ligne 18
			savings.push({ i, j, saving });
		}
	}

	// Ajouter un facteur aléatoire pour perturber l'ordre des économies
	savings.sort((a, b) => b.saving - a.saving + (Math.random() - 0.5) * 0.01);

	for (let { i, j } of savings) {
		let routeI = routes.find(r => r.includes(i));
		let routeJ = routes.find(r => r.includes(j));

		if (routeI !== routeJ && Math.random() < 0.5) { // Probabilité de 50% de fusionner
			const demandeTotale = routeI.reduce((s, c) => s + demandeCantine[c - 1], 0)
				+ routeJ.reduce((s, c) => s + demandeCantine[c - 1], 0);

			if (demandeTotale <= capaciteMaxVehicule) {
				let newRoute = [...routeI, ...routeJ];
				if (newRoute.reduce((sum, c) => sum + demandeCantine[c - 1], 0) <= capaciteMaxVehicule) {
					routes = routes.filter(r => r !== routeI && r !== routeJ);
					routes.push(newRoute);
				}
			}
		}
	}

	return routes.filter(r => r.length > 1);
}

function ameliorationLocale(solution,distances) {
	let ameliore = true;
	while (ameliore) {
		ameliore = false;
		for (let i = 0; i < solution.length; i++) {
			let nouveauCout = deuxOptIntra(solution[i],distances);
			if (nouveauCout.cout < calculerCoutTournee(solution[i],distances)) {
				solution[i] = nouveauCout.route;
				ameliore = true;
			}
		}
	}
	return solution;
}

function fusionnerRoutesAleatoires(solution,demandeCantine,capaciteMaxVehicule) {
	if (solution.length < 2) return solution;

	const [i, j] = [0, 1].map(() =>
		Math.floor(Math.random() * solution.length)
	);

	const nouvelleRoute = [...solution[i], ...solution[j]];
	if (calculerDemande(nouvelleRoute,demandeCantine) <= capaciteMaxVehicule) {
		return solution.filter((_, k) => k !== i && k !== j).concat([nouvelleRoute]);
	}
	return solution;
}

function calculerDemande(tournee,demandeCantine) {
	return tournee.reduce((sum, c) => sum + demandeCantine[c - 1], 0);
}

function scinderRouteSurplus(solution) {
	const routeIndex = Math.floor(Math.random() * solution.length);
	const route = solution[routeIndex];

	if (route.length < 2) return solution;

	const pointScission = Math.floor(1 + Math.random() * (route.length - 1));
	const nouvellesRoutes = [
		route.slice(0, pointScission),
		route.slice(pointScission)
	];

	return solution
		.filter((_, k) => k !== routeIndex)
		.concat(nouvellesRoutes);
}

function deuxOpt(solution,) {
	let tourneeIndex = Math.floor(Math.random() * solution.length);
	let tournee = solution[tourneeIndex];
	if (tournee.length <= 4) return solution;

	let [i, j] = [
		Math.floor(Math.random() * (tournee.length - 3)) + 1,
		Math.floor(Math.random() * (tournee.length - 1)) + 2
	].sort((a, b) => a - b);

	tournee = [...tournee.slice(0, i), ...tournee.slice(i, j).reverse(), ...tournee.slice(j)];
	solution[tourneeIndex] = tournee;
	return solution;
}

function deuxOptIntra(route,distances) {
	let bestCost = calculerCoutTournee(route,distances);
	let bestRoute = [...route];

	for (let i = 1; i < route.length - 2; i++) {
		for (let j = i + 1; j < route.length - 1; j++) {
			let newRoute = [
				...route.slice(0, i),
				...route.slice(i, j + 1).reverse(),
				...route.slice(j + 1)
			];
			let newCost = calculerCoutTournee(newRoute,distances);
			if (newCost < bestCost) {
				bestCost = newCost;
				bestRoute = newRoute;
			}
		}
	}

	return { route: bestRoute, cout: bestCost };
}

function orOpt(solution) {
	let tourneeIndex = Math.floor(Math.random() * solution.length);
	let tournee = solution[tourneeIndex];
	if (tournee.length < 3) return solution;

	let longueurSequence = Math.min(3, Math.floor(Math.random() * (tournee.length - 1)) + 1);
	let debutSequence = Math.floor(Math.random() * (tournee.length - longueurSequence));
	let nouvellePosition = Math.floor(Math.random() * (tournee.length - longueurSequence + 1));

	while (nouvellePosition > debutSequence && nouvellePosition < debutSequence + longueurSequence) {
		nouvellePosition = Math.floor(Math.random() * (tournee.length - longueurSequence + 1));
	}

	let sequence = tournee.splice(debutSequence, longueurSequence);
	tournee.splice(nouvellePosition, 0, ...sequence);

	solution[tourneeIndex] = tournee;
	return solution;
}

function echangeInterTournees(solution, demandeCantine, capaciteMaxVehicule) {
	if (solution.length < 2) return solution;

	let [v1, v2] = [0, 0].map(() =>
		Math.floor(Math.random() * solution.filter(r => r.length > 0).length)
	);

	let tentative = solution.map(r => [...r]);
	const [c1, c2] = [Math.floor(Math.random() * tentative[v1].length), Math.floor(Math.random() * tentative[v2].length)];

	const demandeAvant = [
		tentative[v1].reduce((s, c) => s + demandeCantine[c - 1], 0),
		tentative[v2].reduce((s, c) => s + demandeCantine[c - 1], 0)
	];

	const demandeApres = [
		demandeAvant[0] - demandeCantine[tentative[v1][c1] - 1] + demandeCantine[tentative[v2][c2] - 1],
		demandeAvant[1] - demandeCantine[tentative[v2][c2] - 1] + demandeCantine[tentative[v1][c1] - 1]
	];

	if (demandeApres[0] <= capaciteMaxVehicule && demandeApres[1] <= capaciteMaxVehicule) {
		[tentative[v1][c1], tentative[v2][c2]] = [tentative[v2][c2], tentative[v1][c1]];
	}

	return tentative;
}

function echangeSequences(solution,demandeCantine, capaciteMaxVehicule) {
	if (solution.length < 2) return solution;

	let [v1, v2] = [0, 0].map(() =>
		Math.floor(Math.random() * solution.filter(r => r.length > 0).length)
	);

	let tentative = solution.map(r => [...r]);
	const longueurSequence = Math.min(3, Math.floor(Math.random() * Math.min(tentative[v1].length, tentative[v2].length)));

	const debutSequence1 = Math.floor(Math.random() * (tentative[v1].length - longueurSequence + 1));
	const debutSequence2 = Math.floor(Math.random() * (tentative[v2].length - longueurSequence + 1));

	const sequence1 = tentative[v1].splice(debutSequence1, longueurSequence);
	const sequence2 = tentative[v2].splice(debutSequence2, longueurSequence);

	tentative[v1].splice(debutSequence1, 0, ...sequence2);
	tentative[v2].splice(debutSequence2, 0, ...sequence1);

	if (tentative.every(route => calculerDemande(route, demandeCantine) <= capaciteMaxVehicule)) {
		return tentative;
	}

	return solution;
}

function inversionSequence(solution) {
	let tourneeIndex = Math.floor(Math.random() * solution.length);
	let tournee = solution[tourneeIndex];
	if (tournee.length <= 2) return solution;

	let [i, j] = [
		Math.floor(Math.random() * (tournee.length - 1)),
		Math.floor(Math.random() * (tournee.length - 1))
	].sort((a, b) => a - b);

	tournee = [...tournee.slice(0, i), ...tournee.slice(i, j + 1).reverse(), ...tournee.slice(j + 1)];
	solution[tourneeIndex] = tournee;
	return solution;
}

function insertionAleatoire(solution, demandeCantine, capaciteMaxVehicule) {
	if (solution.length < 2) return solution;

	let [v1, v2] = [0, 0].map(() =>
		Math.floor(Math.random() * solution.filter(r => r.length > 0).length)
	);

	let tentative = solution.map(r => [...r]);
	const c1 = Math.floor(Math.random() * tentative[v1].length);
	const c2 = Math.floor(Math.random() * (tentative[v2].length + 1));

	const cantine = tentative[v1].splice(c1, 1)[0];
	tentative[v2].splice(c2, 0, cantine);

	if (calculerDemande(tentative[v2],demandeCantine) <= capaciteMaxVehicule) {
		return tentative;
	}

	return solution;
}

function swapCantinesEntreRoutes(solution, demandeCantine, capaciteMaxVehicule) {
	if (solution.length < 2) return solution;

	let [v1, v2] = [0, 0].map(() =>
		Math.floor(Math.random() * solution.filter(r => r.length > 0).length)
	);

	let tentative = solution.map(r => [...r]);
	const [c1, c2] = [Math.floor(Math.random() * tentative[v1].length), Math.floor(Math.random() * tentative[v2].length)];

	const demandeAvant = [
		tentative[v1].reduce((s, c) => s + demandeCantine[c - 1], 0),
		tentative[v2].reduce((s, c) => s + demandeCantine[c - 1], 0)
	];

	const demandeApres = [
		demandeAvant[0] - demandeCantine[tentative[v1][c1] - 1] + demandeCantine[tentative[v2][c2] - 1],
		demandeAvant[1] - demandeCantine[tentative[v2][c2] - 1] + demandeCantine[tentative[v1][c1] - 1]
	];

	if (demandeApres[0] <= capaciteMaxVehicule && demandeApres[1] <= capaciteMaxVehicule) {
		[tentative[v1][c1], tentative[v2][c2]] = [tentative[v2][c2], tentative[v1][c1]];
	}

	return tentative;
}

function deplacementMultiple(solution, demandeCantine, capaciteMaxVehicule) {
	if (solution.length < 2) return solution;

	let [v1, v2] = [0, 0].map(() =>
		Math.floor(Math.random() * solution.filter(r => r.length > 0).length)
	);

	let tentative = solution.map(r => [...r]);
	const longueurSequence = Math.min(3, Math.floor(Math.random() * Math.min(tentative[v1].length, tentative[v2].length)));

	const debutSequence1 = Math.floor(Math.random() * (tentative[v1].length - longueurSequence + 1));
	const debutSequence2 = Math.floor(Math.random() * (tentative[v2].length - longueurSequence + 1));

	const sequence1 = tentative[v1].splice(debutSequence1, longueurSequence);
	const sequence2 = tentative[v2].splice(debutSequence2, longueurSequence);

	tentative[v1].splice(debutSequence1, 0, ...sequence2);
	tentative[v2].splice(debutSequence2, 0, ...sequence1);

	if (tentative.every(route => calculerDemande(route, demandeCantine) <= capaciteMaxVehicule)) {
		return tentative;
	}

	return solution;
}

function perturbationAleatoire(solution) {
	let tourneeIndex = Math.floor(Math.random() * solution.length);
	let tournee = solution[tourneeIndex];
	if (tournee.length <= 2) return solution;

	// Inverser une grande partie de la tournée
	let [i, j] = [
		Math.floor(Math.random() * (tournee.length - 1)),
		Math.floor(Math.random() * (tournee.length - 1))
	].sort((a, b) => a - b);

	tournee = [...tournee.slice(0, i), ...tournee.slice(i, j + 1).reverse(), ...tournee.slice(j + 1)];
	solution[tourneeIndex] = tournee;
	return solution;
}

function genererVoisin(solution, demandeCantine, capaciteMaxVehicule) {
	const operations = [
		() => deuxOpt(solution),
		() => orOpt(solution),
		() => echangeInterTournees(solution,demandeCantine, capaciteMaxVehicule),
		() => fusionnerRoutesAleatoires(solution,demandeCantine),
		() => scinderRouteSurplus(solution),
		() => swapCantinesEntreRoutes(solution,demandeCantine, capaciteMaxVehicule),
		() => insertionAleatoire(solution, demandeCantine,capaciteMaxVehicule),
		() => inversionSequence(solution),
		() => echangeSequences(solution, demandeCantine, capaciteMaxVehicule),
		() => perturbationAleatoire(solution),
		() => deplacementMultiple(solution,demandeCantine, capaciteMaxVehicule )
	];

	return operations[Math.floor(Math.random() * operations.length)]();
}

function calculerCout(solution,demandeCantine,distances) {
	const cantinesVisitees = new Set(solution.flat());
	const penalite = (demandeCantine.length - cantinesVisitees.size) * 1000;

	return solution.reduce((total, tournee) =>
		total + calculerCoutTournee(tournee,distances), 0
	) + penalite;
}

function calculerCoutTournee(tournee,distances) {
	if (tournee.length === 0) return 0;
	let distance = distances[0][tournee[0]];
	for (let i = 0; i < tournee.length - 1; i++) {
		distance += distances[tournee[i]][tournee[i + 1]];
	}
	distance += distances[tournee[tournee.length - 1]][0];
	return distance;
}

function estSolutionValide(solution,demandeCantine,capaciteMaxVehicule) {
	return solution.every(tournee =>
		tournee.reduce((sum, c) => sum + demandeCantine[c - 1], 0) <= capaciteMaxVehicule
	);
}

function calculerTemperatureInitiale(solutionInitiale,demandeCantine,distances) {
	let coutInitial = calculerCout(solutionInitiale,demandeCantine,distances);
	return -coutInitial / Math.log(0.8);
}

function ajusterTemperature(temperature, refroidissement) {
	return temperature * refroidissement;
}

async function recuitSimuleParallele(nbThreads, maxIterations, refroidissement, solutionInitiale, temperature, nbVehicules,parametres) {
	let promesses = [];
	for (let i = 0; i < nbThreads; i++) {
		promesses.push(recuitSimule(maxIterations, refroidissement, solutionInitiale, temperature, nbVehicules,parametres));
	}
	let resultats = await Promise.all(promesses);
	return resultats.reduce((meilleur, resultat) =>
		resultat.meilleurCout < meilleur.meilleurCout ? resultat : meilleur
	);
}

function reinitialisationAleatoire(solution) {
	let tourneeIndex = Math.floor(Math.random() * solution.length);
	let tournee = solution[tourneeIndex];
	if (tournee.length <= 2) return solution;

	// Mélanger aléatoirement la tournée
	tournee = tournee.sort(() => Math.random() - 0.5);
	solution[tourneeIndex] = tournee;
	return solution;
}

function recuitSimule(maxIterations, refroidissement, nbSolutionInitiale, temperatureP, nbVehicules,parametres) {
	let t0 = performance.now();

	let stagnation = 0;
	const maxStagnation = 10000;

	let capaciteMaxVehicule = parametres["capaciteMaxVehicule"];
	let demandeCantine = parametres["demandeCantine"];
	let distances = parametres["distances"];

	// Génération de solutions initiales
	const nbSolutionsInitiales = nbSolutionInitiale;
	let meilleuresSolutionsInitiales = [];
	for (let i = 0; i < nbSolutionsInitiales; i++) {
		let solution = genererSolutionInitiale(demandeCantine,capaciteMaxVehicule,distances,nbVehicules);
		let cout = calculerCout(solution,demandeCantine,distances);
		meilleuresSolutionsInitiales.push({ solution, cout });
	}

	meilleuresSolutionsInitiales.sort((a, b) => a.cout - b.cout);
	let solutionActuelle = meilleuresSolutionsInitiales[0].solution;
	let meilleurSolution = solutionActuelle;
	let meilleurCout = meilleuresSolutionsInitiales[0].cout;

	let temperature = calculerTemperatureInitiale(solutionActuelle,demandeCantine,distances);

	for (let i = 0; i < maxIterations; i++) {
		let nouvelleSolution = genererVoisin(solutionActuelle, demandeCantine, capaciteMaxVehicule);

		if (!estSolutionValide(nouvelleSolution,demandeCantine,capaciteMaxVehicule)) continue;

		let nouveauCout = calculerCout(nouvelleSolution,demandeCantine,distances);
		let delta = nouveauCout - calculerCout(nouvelleSolution,demandeCantine,distances);

		if (delta < 0 || Math.exp(-delta / temperature) > Math.random()) {
			solutionActuelle = nouvelleSolution;
			if (nouveauCout < meilleurCout) {
				meilleurSolution = nouvelleSolution;
				meilleurCout = nouveauCout;
				stagnation = 0;
			} else {
				stagnation++;
				if (stagnation > (maxStagnation / 2))
					reinitialisationAleatoire(solutionActuelle);
				if (stagnation > maxStagnation) break;
			}
		}

		temperature = ajusterTemperature(temperature, refroidissement);
	}

	let tempsExecution = performance.now() - t0;
	return { meilleurSolution, meilleurCout, tempsExecution };
}

/**
* Analyse une chaîne de paramètres et renvoie un objet contenant les valeurs extraites.
*
* @param {string} chaineParametre - La chaîne de paramètres à analyser.  Elle doit être formatée comme un fichier texte avec des assignations de variables.
* @returns {object} - Un objet contenant les paramètres extraits de la chaîne.
* @throws {Error} - Si la chaîne d'entrée est vide ou non valide.
*/
/**
* Analyse une chaîne de paramètres et renvoie un objet contenant les valeurs extraites.
*
* @param {string} chaineParametre - La chaîne de paramètres à analyser. Elle doit être formatée comme un fichier texte avec des assignations de variables.
* @returns {object} - Un objet contenant les paramètres extraits de la chaîne.
* @throws {Error} - Si la chaîne d'entrée est vide ou non valide.
*/
async function listerParametres(chaineParametre) {
if (!chaineParametre || chaineParametre.trim() === "") {
	throw new Error("La chaîne de paramètres ne peut pas être vide.");
}

const parametres = {};
const lignes = chaineParametre.split(';\n').map(line => line.trim());

for (const ligne of lignes) {
	if (ligne) {
		const [cle, valeur] = ligne.split(' = ');
		const cleNettoyee = cle.trim();
		let valeurNettoyee = valeur.trim();

		if (!isNaN(valeurNettoyee)) {
			valeurNettoyee = Number(valeurNettoyee);
		} else if (valeurNettoyee.startsWith('[') && valeurNettoyee.endsWith(']')) {
			try {
				valeurNettoyee = JSON.parse(valeurNettoyee);
			} catch (e) {
				console.error("Erreur lors de la conversion du tableau:", e);
			}
		}

		parametres[cleNettoyee] = valeurNettoyee;
	}
}

return parametres;
}

function verifierResultatsRecuitSimule(solution, demandeCantine, capaciteMaxVehicule, nbVehicules) {
    const clientsVisites = new Set();

    if (solution.length > nbVehicules +1 ) {
        throw new Error(`Le problème est insolvable avec ce nombre de véhicules (${nbVehicules}).`);
    }

    for (const route of solution) {
        let demandeTotale = 0;

        // Vérifier la capacité de la route
        for (const client of route) {
            if (client !== 0) {
                demandeTotale += demandeCantine[client - 1];
                clientsVisites.add(client);
            }
        }

        if (demandeTotale > capaciteMaxVehicule) {
            throw new Error(`La demande totale (${demandeTotale}) de la route [${route}] dépasse la capacité maximale (${capaciteMaxVehicule}).`);
        }
    }

    for (let i = 0; i < demandeCantine.length; i++) {
        if (!clientsVisites.has(i + 1)) {
            throw new Error(`Le client ${i + 1} n'est pas visité.`);
        }
    }

    return {erreur: true, message: "Tous les contrôles sont validés. La solution est correcte."};
}

/**
 * Algorithme de recuit simulé pour résoudre un problème d'optimisation.
 *
 * @param {string} data Données du problème.
 * @param {number} maxIterations Nombre maximal d'itérations de l'algorithme.
 * @param {number} refroidissement Taux de refroidissement de la température.
 * @param {number} nbSolutionInitiale Nombre de solutions initiales à générer.
 * @param {number} temperature Température initiale.
 * @param {number} nbVehicules Nombre de véhicules disponibles.
 * @returns {{meilleurSolution: any, meilleurCout: number, tempsExecution: number}}
 *   Un objet contenant la meilleure solution trouvée, son coût et le temps d'exécution.
 */
export async function runSimulatedAnnealing(maxIterations, refroidissement, solutionInitiale, temperature, nbVehicules, chaineParamètre) {
	const nbExecutions = 10;
	let meilleureExecutionCout = Infinity;
	let meilleureExecutionSolution = null;
	let tempsDExecution = 0;


	const parametres = await listerParametres(chaineParamètre);
	console.log("Paramètres extraits:", parametres);

	for (let i = 0; i < nbExecutions; i++) {
		const resultats = await recuitSimuleParallele(15, maxIterations, refroidissement, solutionInitiale, temperature, nbVehicules,parametres);

		verifierResultatsRecuitSimule(resultats.meilleurSolution,parametres.demandeCantine,parametres.capaciteMaxVehicule,nbVehicules);

		if (resultats.meilleurCout < meilleureExecutionCout) {
			meilleureExecutionCout = resultats.meilleurCout;
			meilleureExecutionSolution = resultats.meilleurSolution;
			tempsDExecution = resultats.tempsExecution;
		}
	}


	let resultatJson = {
		cout: meilleureExecutionCout,
		solution: meilleureExecutionSolution,
		tempsExecution: tempsDExecution,
		distances: parametres.distances,
		demandeCantine: parametres.demandeCantine,
	};

	return resultatJson
}

