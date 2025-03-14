function genererSolutionInitiale(demandeCantine, capaciteMaxVehicule, distances) {
    // Génère une solution initiale en utilisant l'algorithme de Clarke-Wright
    let solution = clarkeWrightSavings(demandeCantine, capaciteMaxVehicule, distances);
    
    // Applique une amélioration locale pour optimiser la solution trouvée
    return ameliorationLocale(solution, distances);
}

function clarkeWrightSavings(demandeCantine, capaciteMaxVehicule, distances) {
    const nbCantines = demandeCantine.length;
    
    // Initialisation des routes : chaque cantine est une route séparée
    let routes = Array.from({ length: nbCantines }, (_, i) => [i + 1]);
    
    // Mélange des routes initiales pour ajouter de la stochasticité
    routes = routes.sort(() => Math.random() - 0.5);

    let savings = [];

    // Calcul des économies (savings) pour toutes les paires de cantines
    for (let i = 1; i <= nbCantines; i++) {
        for (let j = i + 1; j <= nbCantines; j++) {
            let saving = distances[0][i] + distances[0][j] - distances[i][j]; // Économie réalisée en fusionnant les trajets
            savings.push({ i, j, saving });
        }
    }

    // Tri des économies par ordre décroissant avec une légère perturbation aléatoire
    savings.sort((a, b) => b.saving - a.saving + (Math.random() - 0.5) * 0.01);

    // Fusion des routes selon l'algorithme de Clarke-Wright
    for (let { i, j } of savings) {
        let routeI = routes.find(r => r.includes(i));
        let routeJ = routes.find(r => r.includes(j));
        
        // Vérifie si les routes sont différentes et applique une probabilité de fusion de 50%
        if (routeI !== routeJ && Math.random() < 0.5) {
            const demandeTotale = routeI.reduce((s, c) => s + demandeCantine[c - 1], 0)
                + routeJ.reduce((s, c) => s + demandeCantine[c - 1], 0);
            
            // Fusionne les routes si la capacité du véhicule le permet
            if (demandeTotale <= capaciteMaxVehicule) {
                let newRoute = [...routeI, ...routeJ];
                if (newRoute.reduce((sum, c) => sum + demandeCantine[c - 1], 0) <= capaciteMaxVehicule) {
                    routes = routes.filter(r => r !== routeI && r !== routeJ);
                    routes.push(newRoute);
                }
            }
        }
    }
    
    // Supprime les routes ne contenant qu'un seul point
    return routes.filter(r => r.length > 1);
}

function ameliorationLocale(solution, distances) {
    let ameliore = true; // Indicateur de poursuite de l'amélioration

    // Boucle jusqu'à ce qu'aucune amélioration ne soit trouvée
    while (ameliore) {
        ameliore = false; // On suppose qu'il n'y a plus d'amélioration

        // Parcourt chaque tournée dans la solution
        for (let i = 0; i < solution.length; i++) {
            // Applique l'optimisation 2-opt sur la tournée actuelle
            let nouveauCout = deuxOptIntra(solution[i], distances);

            // Vérifie si la nouvelle tournée a un coût inférieur à l'ancienne
            if (nouveauCout.cout < calculerCoutTournee(solution[i], distances)) {
                solution[i] = nouveauCout.route; // Met à jour la tournée
                ameliore = true; // Indique qu'une amélioration a été trouvée
            }
        }
    }
    
    return solution; // Retourne la solution améliorée
}

function fusionnerRoutesAleatoires(solution, demandeCantine, capaciteMaxVehicule) {
    if (solution.length < 2) return solution;

    // Sélection aléatoire de deux routes distinctes
    const [i, j] = [0, 1].map(() => Math.floor(Math.random() * solution.length));

    const nouvelleRoute = [...solution[i], ...solution[j]];
    // Vérifie si la nouvelle route respecte la capacité
    if (calculerDemande(nouvelleRoute, demandeCantine) <= capaciteMaxVehicule) {
        return solution.filter((_, k) => k !== i && k !== j).concat([nouvelleRoute]);
    }
    return solution;
}

function calculerDemande(tournee, demandeCantine) {
    // Calcule la demande totale d'une tournée donnée
    return tournee.reduce((sum, c) => sum + demandeCantine[c - 1], 0);
}

function scinderRouteSurplus(solution) {
    // Sélection d'une route au hasard
    const routeIndex = Math.floor(Math.random() * solution.length);
    const route = solution[routeIndex];

    // Si la route contient un seul point, pas de scission possible
    if (route.length < 2) return solution;

    // Choix d'un point de coupure aléatoire
    const pointScission = Math.floor(1 + Math.random() * (route.length - 1));
    const nouvellesRoutes = [
        route.slice(0, pointScission),
        route.slice(pointScission)
    ];

    return solution.filter((_, k) => k !== routeIndex).concat(nouvellesRoutes);
}

function deuxOpt(solution) {
    let tourneeIndex = Math.floor(Math.random() * solution.length);
    let tournee = solution[tourneeIndex];
    if (tournee.length <= 4) return solution;

    // Sélection de deux indices aléatoires i et j pour inversion
    let [i, j] = [
        Math.floor(Math.random() * (tournee.length - 3)) + 1,
        Math.floor(Math.random() * (tournee.length - 1)) + 2
    ].sort((a, b) => a - b);

    // Applique l'inversion des éléments entre i et j
    tournee = [...tournee.slice(0, i), ...tournee.slice(i, j).reverse(), ...tournee.slice(j)];
    solution[tourneeIndex] = tournee;
    return solution;
}

function deuxOptIntra(route, distances) {
    let bestCost = calculerCoutTournee(route, distances);
    let bestRoute = [...route];

    for (let i = 1; i < route.length - 2; i++) {
        for (let j = i + 1; j < route.length - 1; j++) {
            // Inverse la sous-séquence entre i et j
            let newRoute = [
                ...route.slice(0, i),
                ...route.slice(i, j + 1).reverse(),
                ...route.slice(j + 1)
            ];
            let newCost = calculerCoutTournee(newRoute, distances);
            if (newCost < bestCost) {
                bestCost = newCost;
                bestRoute = newRoute;
            }
        }
    }

    return { route: bestRoute, cout: bestCost };
}

function orOpt(solution) {
    // Sélectionne aléatoirement une tournée dans la solution
    let tourneeIndex = Math.floor(Math.random() * solution.length);
    let tournee = solution[tourneeIndex];

    // Si la tournée a moins de 3 points, il est inutile d'appliquer Or-opt
    if (tournee.length < 3) return solution;

    // Détermine une séquence de clients à déplacer (entre 1 et 3)
    let longueurSequence = Math.min(3, Math.floor(Math.random() * (tournee.length - 1)) + 1);
    let debutSequence = Math.floor(Math.random() * (tournee.length - longueurSequence));

    // Choisit une nouvelle position où insérer la séquence
    let nouvellePosition = Math.floor(Math.random() * (tournee.length - longueurSequence + 1));

    // S'assure que la nouvelle position ne chevauche pas la séquence d'origine
    while (nouvellePosition > debutSequence && nouvellePosition < debutSequence + longueurSequence) {
        nouvellePosition = Math.floor(Math.random() * (tournee.length - longueurSequence + 1));
    }

    // Extrait la séquence et la réinsère à la nouvelle position
    let sequence = tournee.splice(debutSequence, longueurSequence);
    tournee.splice(nouvellePosition, 0, ...sequence);

    // Met à jour la solution avec la tournée modifiée
    solution[tourneeIndex] = tournee;
    return solution;
}


function echangeInterTournees(solution, demandeCantine, capaciteMaxVehicule) {
    if (solution.length < 2) return solution; // Nécessite au moins 2 tournées

    // Sélectionne deux tournées aléatoires non vides
    let [v1, v2] = [0, 0].map(() =>
        Math.floor(Math.random() * solution.filter(r => r.length > 0).length)
    );

    // Crée une copie de la solution
    let tentative = solution.map(r => [...r]);

    // Sélectionne aléatoirement un client de chaque tournée
    const [c1, c2] = [
        Math.floor(Math.random() * tentative[v1].length),
        Math.floor(Math.random() * tentative[v2].length)
    ];

    // Calcule la demande totale avant l'échange
    const demandeAvant = [
        tentative[v1].reduce((s, c) => s + demandeCantine[c - 1], 0),
        tentative[v2].reduce((s, c) => s + demandeCantine[c - 1], 0)
    ];

    // Calcule la demande après l'échange des deux clients
    const demandeApres = [
        demandeAvant[0] - demandeCantine[tentative[v1][c1] - 1] + demandeCantine[tentative[v2][c2] - 1],
        demandeAvant[1] - demandeCantine[tentative[v2][c2] - 1] + demandeCantine[tentative[v1][c1] - 1]
    ];

    // Vérifie si l'échange respecte les capacités des véhicules
    if (demandeApres[0] <= capaciteMaxVehicule && demandeApres[1] <= capaciteMaxVehicule) {
        // Échange les clients entre les deux tournées
        [tentative[v1][c1], tentative[v2][c2]] = [tentative[v2][c2], tentative[v1][c1]];
    }

    return tentative;
}

function echangeSequences(solution, demandeCantine, capaciteMaxVehicule) {
    if (solution.length < 2) return solution; // Nécessite au moins 2 tournées

    // Sélectionne aléatoirement deux tournées non vides
    let [v1, v2] = [0, 0].map(() =>
        Math.floor(Math.random() * solution.filter(r => r.length > 0).length)
    );

    // Crée une copie de la solution
    let tentative = solution.map(r => [...r]);

    // Détermine la longueur de la séquence à échanger (max 3)
    const longueurSequence = Math.min(3, Math.floor(Math.random() * Math.min(tentative[v1].length, tentative[v2].length)));

    // Sélectionne un point de départ pour chaque séquence à échanger
    const debutSequence1 = Math.floor(Math.random() * (tentative[v1].length - longueurSequence + 1));
    const debutSequence2 = Math.floor(Math.random() * (tentative[v2].length - longueurSequence + 1));

    // Extrait les séquences des deux tournées
    const sequence1 = tentative[v1].splice(debutSequence1, longueurSequence);
    const sequence2 = tentative[v2].splice(debutSequence2, longueurSequence);

    // Échange les séquences entre les deux tournées
    tentative[v1].splice(debutSequence1, 0, ...sequence2);
    tentative[v2].splice(debutSequence2, 0, ...sequence1);

    // Vérifie si chaque tournée respecte encore la capacité maximale
    if (tentative.every(route => calculerDemande(route, demandeCantine) <= capaciteMaxVehicule)) {
        return tentative; // Retourne la solution modifiée si l'échange est valide
    }

    return solution; // Retourne la solution d'origine si l'échange dépasse la capacité
}


function inversionSequence(solution) {
    // Sélectionne aléatoirement une tournée
    let tourneeIndex = Math.floor(Math.random() * solution.length);
    let tournee = solution[tourneeIndex];
    
    // Vérifie que la tournée a au moins 3 clients pour appliquer l'inversion
    if (tournee.length <= 2) return solution;
    
    // Sélectionne deux indices aléatoires i et j, avec i < j
    let [i, j] = [
        Math.floor(Math.random() * (tournee.length - 1)),
        Math.floor(Math.random() * (tournee.length - 1))
    ].sort((a, b) => a - b);
    
    // Inverse la séquence entre i et j
    tournee = [...tournee.slice(0, i), ...tournee.slice(i, j + 1).reverse(), ...tournee.slice(j + 1)];
    
    // Met à jour la solution
    solution[tourneeIndex] = tournee;
    return solution;
}


function insertionAleatoire(solution, demandeCantine, capaciteMaxVehicule) {
    if (solution.length < 2) return solution; // Nécessite au moins 2 tournées
    
    // Sélectionne deux tournées aléatoires
    let [v1, v2] = [0, 0].map(() =>
        Math.floor(Math.random() * solution.filter(r => r.length > 0).length)
    );
    
    // Crée une copie de la solution
    let tentative = solution.map(r => [...r]);
    
    // Sélectionne une cantine aléatoire dans v1 et une position d'insertion dans v2
    const c1 = Math.floor(Math.random() * tentative[v1].length);
    const c2 = Math.floor(Math.random() * (tentative[v2].length + 1));
    
    // Déplace la cantine de v1 vers v2
    const cantine = tentative[v1].splice(c1, 1)[0];
    tentative[v2].splice(c2, 0, cantine);
    
    // Vérifie que la nouvelle demande de v2 respecte la capacité du véhicule
    if (calculerDemande(tentative[v2], demandeCantine) <= capaciteMaxVehicule) {
        return tentative;
    }
    
    return solution;
}

function swapCantinesEntreRoutes(solution, demandeCantine, capaciteMaxVehicule) {
    if (solution.length < 2) return solution; // Nécessite au moins 2 tournées
    
    // Sélectionne deux tournées aléatoires
    let [v1, v2] = [0, 0].map(() =>
        Math.floor(Math.random() * solution.filter(r => r.length > 0).length)
    );
    
    // Crée une copie de la solution
    let tentative = solution.map(r => [...r]);
    
    // Sélectionne une cantine aléatoire dans chaque tournée
    const [c1, c2] = [
        Math.floor(Math.random() * tentative[v1].length),
        Math.floor(Math.random() * tentative[v2].length)
    ];
    
    // Calcule la demande avant l'échange
    const demandeAvant = [
        tentative[v1].reduce((s, c) => s + demandeCantine[c - 1], 0),
        tentative[v2].reduce((s, c) => s + demandeCantine[c - 1], 0)
    ];
    
    // Calcule la demande après l'échange
    const demandeApres = [
        demandeAvant[0] - demandeCantine[tentative[v1][c1] - 1] + demandeCantine[tentative[v2][c2] - 1],
        demandeAvant[1] - demandeCantine[tentative[v2][c2] - 1] + demandeCantine[tentative[v1][c1] - 1]
    ];
    
    // Vérifie si l'échange respecte les capacités des véhicules
    if (demandeApres[0] <= capaciteMaxVehicule && demandeApres[1] <= capaciteMaxVehicule) {
        // Effectue l'échange des cantines entre les deux tournées
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

// Opérations de voisinage aléatoires pour explorer le plus de solution possible
function genererVoisin(solution, demandeCantine, capaciteMaxVehicule) {
    // Liste des opérations de modification possibles
    const operations = [
        () => deuxOpt(solution),
        () => orOpt(solution),
        () => echangeInterTournees(solution, demandeCantine, capaciteMaxVehicule),
        () => fusionnerRoutesAleatoires(solution, demandeCantine),
        () => scinderRouteSurplus(solution),
        () => swapCantinesEntreRoutes(solution, demandeCantine, capaciteMaxVehicule),
        () => insertionAleatoire(solution, demandeCantine, capaciteMaxVehicule),
        () => inversionSequence(solution),
        () => echangeSequences(solution, demandeCantine, capaciteMaxVehicule),
        () => perturbationAleatoire(solution),
        () => deplacementMultiple(solution, demandeCantine, capaciteMaxVehicule)
    ];

    // Sélection et exécution d'une opération aléatoire
    return operations[Math.floor(Math.random() * operations.length)]();
}

function calculerCout(solution, demandeCantine, distances) {
    // Vérifie quelles cantines ont été visitées
    const cantinesVisitees = new Set(solution.flat());

    // Applique une pénalité pour chaque cantine non visitée
    const penalite = (demandeCantine.length - cantinesVisitees.size) * 1000;

    // Calcule le coût total en additionnant le coût de chaque tournée et la pénalité
    return solution.reduce((total, tournee) => 
        total + calculerCoutTournee(tournee, distances), 0
    ) + penalite;
}


function calculerCoutTournee(tournee, distances) {
    if (tournee.length === 0) return 0;

    // Commence par la distance du dépôt à la première cantine
    let distance = distances[0][tournee[0]];

    // Ajoute les distances entre les cantines
    for (let i = 0; i < tournee.length - 1; i++) {
        distance += distances[tournee[i]][tournee[i + 1]];
    }

    // Retour au dépôt après la dernière cantine
    distance += distances[tournee[tournee.length - 1]][0];

    return distance;
}

function estSolutionValide(solution, demandeCantine, capaciteMaxVehicule) {
    // Vérifie que chaque tournée respecte la capacité du véhicule
    return solution.every(tournee =>
        tournee.reduce((sum, c) => sum + demandeCantine[c - 1], 0) <= capaciteMaxVehicule
    );
}

function calculerTemperatureInitiale(solutionInitiale, demandeCantine, distances) {
    let coutInitial = calculerCout(solutionInitiale, demandeCantine, distances);
    return -coutInitial / Math.log(0.8);
}

function ajusterTemperature(temperature, refroidissement) {
    return temperature * refroidissement;
}

/**
 * Exécute le recuit simulé en parallèle avec plusieurs threads.
 */
async function recuitSimuleParallele(nbThreads, maxIterations, refroidissement, solutionInitiale, temperature, nbVehicules, parametres) {
    let promesses = [];

    // Lancement de plusieurs exécutions du recuit simulé en parallèle
    for (let i = 0; i < nbThreads; i++) {
        promesses.push(recuitSimule(maxIterations, refroidissement, solutionInitiale, temperature, nbVehicules, parametres));
    }

    // Attente de tous les résultats et sélection du meilleur
    let resultats = await Promise.all(promesses);
    return resultats.reduce((meilleur, resultat) =>
        resultat.meilleurCout < meilleur.meilleurCout ? resultat : meilleur
    );
}

/**
 * Réinitialise aléatoirement une tournée en mélangeant son ordre.
 * @param {Array} solution - La solution contenant les tournées.
 * @returns {Array} - La solution modifiée.
 */
function reinitialisationAleatoire(solution) {
    let tourneeIndex = Math.floor(Math.random() * solution.length);
    let tournee = solution[tourneeIndex];

    // Si la tournée contient 2 cantines ou moins, ne pas modifier
    if (tournee.length <= 2) return solution;

    // Mélange aléatoire de l'ordre des cantines dans la tournée
    tournee = tournee.sort(() => Math.random() - 0.5);
    solution[tourneeIndex] = tournee;

    return solution;
}

/**
 * Implémente l'algorithme de recuit simulé pour optimiser les tournées de livraison.
 * @param {number} maxIterations - Nombre maximal d'itérations.
 * @param {number} refroidissement - Facteur de refroidissement.
 * @param {number} nbSolutionInitiale - Nombre de solutions initiales générées.
 * @param {number} temperatureP - Température initiale (non utilisée).
 * @param {number} nbVehicules - Nombre de véhicules disponibles.
 * @param {Object} parametres - Paramètres de l'algorithme.
 * @returns {Object} - La meilleure solution trouvée avec son coût et le temps d'exécution.
 */
function recuitSimule(maxIterations, refroidissement, nbSolutionInitiale, temperatureP, nbVehicules, parametres) {
    let t0 = performance.now(); // Début du chronomètre

    let stagnation = 0;
    const maxStagnation = 10000;

    // Extraction des paramètres
    let capaciteMaxVehicule = parametres["capaciteMaxVehicule"];
    let demandeCantine = parametres["demandeCantine"];
    let distances = parametres["distances"];

    // Génération de solutions initiales
    const nbSolutionsInitiales = nbSolutionInitiale;
    let meilleuresSolutionsInitiales = [];
    
    for (let i = 0; i < nbSolutionsInitiales; i++) {
        let solution = genererSolutionInitiale(demandeCantine, capaciteMaxVehicule, distances, nbVehicules);
        let cout = calculerCout(solution, demandeCantine, distances);
        meilleuresSolutionsInitiales.push({ solution, cout });
    }

    // Trier les solutions pour prendre la meilleure comme point de départ
    meilleuresSolutionsInitiales.sort((a, b) => a.cout - b.cout);
    let solutionActuelle = meilleuresSolutionsInitiales[0].solution;
    let meilleurSolution = solutionActuelle;
    let meilleurCout = meilleuresSolutionsInitiales[0].cout;

    // Calcul de la température initiale
    let temperature = calculerTemperatureInitiale(solutionActuelle, demandeCantine, distances);

    // Boucle principale du recuit simulé
    for (let i = 0; i < maxIterations; i++) {
        let nouvelleSolution = genererVoisin(solutionActuelle, demandeCantine, capaciteMaxVehicule);

        // Vérifier la validité de la solution
        if (!estSolutionValide(nouvelleSolution, demandeCantine, capaciteMaxVehicule)) continue;

        let nouveauCout = calculerCout(nouvelleSolution, demandeCantine, distances);
        let delta = nouveauCout - calculerCout(solutionActuelle, demandeCantine, distances); // BUG : delta est toujours 0

        // Critère d'acceptation de la nouvelle solution
        if (delta < 0 || Math.exp(-delta / temperature) > Math.random()) {
            solutionActuelle = nouvelleSolution;

            // Mise à jour de la meilleure solution
            if (nouveauCout < meilleurCout) {
                meilleurSolution = nouvelleSolution;
                meilleurCout = nouveauCout;
                stagnation = 0;
            } else {
                stagnation++;
                
                // Réinitialisation aléatoire en cas de stagnation
                if (stagnation > (maxStagnation / 2)) {
                    reinitialisationAleatoire(solutionActuelle);
                }
                
                if (stagnation > maxStagnation) break;
            }
        }

        // Mise à jour de la température
        temperature = ajusterTemperature(temperature, refroidissement);
    }

    let tempsExecution = performance.now() - t0; // Calcul du temps d'exécution

    return { meilleurSolution, meilleurCout, tempsExecution };
}


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
    const clientsVisites = new Set(); // Ensemble pour suivre les clients visités
    console.log("Nombre de véhicules utilisés :", solution.length);

    // Vérification du nombre de véhicules utilisés
    if (solution.length > nbVehicules) {
        throw new Error(`Erreur : Trop de véhicules utilisés (${solution.length}) pour un maximum de ${nbVehicules}.`);
    }

    // Parcours de chaque tournée (route) effectuée par un véhicule
    for (const route of solution) {
        let demandeTotale = 0; // Somme des demandes des clients dans la tournée actuelle

        // Vérification de la capacité du véhicule et enregistrement des clients visités
        for (const client of route) {
            if (client !== 0) { // 0 représente généralement l'entrepôt ou le dépôt
                if (client - 1 >= demandeCantine.length || client - 1 < 0) {
                    throw new Error(`Erreur : Client ${client} hors limites.`);
                }

                // Ajouter la demande de la cantine à la somme de la tournée
                demandeTotale += demandeCantine[client - 1];

                // Ajouter le client à la liste des clients visités
                clientsVisites.add(client);
            }
        }

        // Vérification que la demande totale de la tournée ne dépasse pas la capacité du véhicule
        if (demandeTotale > capaciteMaxVehicule) {
            throw new Error(`Erreur : La demande totale (${demandeTotale}) de la tournée [${route}] dépasse la capacité maximale (${capaciteMaxVehicule}).`);
        }
    }

    // Vérification que tous les clients ont été visités au moins une fois
    if (clientsVisites.size !== demandeCantine.length) {
        const clientsManquants = [];
        for (let i = 1; i <= demandeCantine.length; i++) {
            if (!clientsVisites.has(i)) {
                clientsManquants.push(i);
            }
        }
        throw new Error(`Erreur : Les clients suivants n'ont pas été visités : ${clientsManquants.join(", ")}.`);
    }

    console.log("Tous les contrôles sont validés. La solution est correcte.");
    return { erreur: false, message: "Tous les contrôles sont validés. La solution est correcte." };
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
		console.log(`Exécution ${i + 1}:`);
		console.log("Coût total de la meilleure solution :", resultats.meilleurCout);
		console.log("Coût total de la meilleure solution :", resultats.meilleurSolution);


		if (resultats.meilleurCout < meilleureExecutionCout) {
			meilleureExecutionCout = resultats.meilleurCout;
			meilleureExecutionSolution = resultats.meilleurSolution;
			tempsDExecution = resultats.tempsExecution;
		}
	}

	verifierResultatsRecuitSimule(meilleureExecutionSolution,parametres.demandeCantine,parametres.capaciteMaxVehicule,nbVehicules);

	let resultatJson = {
		cout: meilleureExecutionCout,
		solution: meilleureExecutionSolution,
		tempsExecution: tempsDExecution,
		distances: parametres.distances,
		demandeCantine: parametres.demandeCantine,
	};

	console.log(JSON.stringify(resultatJson));
	return resultatJson
}