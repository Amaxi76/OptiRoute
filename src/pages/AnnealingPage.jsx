import React, { useState, useRef, useEffect } from "react";

// External libraries
import { Link   } from "react-router-dom";
import { motion } from "framer-motion";
import { X      } from "lucide-react";

// Services
import GraphVisualization    from '../services/GraphVisualization';
import {runSimulatedAnnealing} from '../services/AnnealingAlgorithm';
import convertor             from "../services/Convertor";

// Components
import InputField from "../components/InputField";
import Spinner    from "../components/Spinner";
import TabButton  from "../components/TabButton";

const AnnealingPage = ( ) => {
	// Form variables
	const [ file              , setFile               ] = useState ( null  );
	const [ nbIteration       , setNbIteration        ] = useState ( 10000 );
	const [ refroidissement   , setRefroidissement    ] = useState ( 0.995 );
	const [ nbSolutionInitiale, setNbSolutionInitiale ] = useState (    10 );
	const [ temperature       , setTemperature        ] = useState ( 10000 );
	const [ generationVoisin  , setGenerationVoisin   ] = useState (    10 );
	const [ nbVehicule        , setNbVehicule         ] = useState (    10 );
	const [ vehicleSelection  , setVehicleSelection   ] = useState (     0 );

	// Form Error handling
	const [ fileError              , setFileError               ] = useState ( "" );
	const [ nbIterationError       , setNbIterationError        ] = useState ( "" );
	const [ refroidissementError   , setRefroidissementError    ] = useState ( "" );
	const [ nbSolutionInitialeError, setNbSolutionInitialeError ] = useState ( "" );
	const [ temperatureError       , setTemperatureError        ] = useState ( "" );
	const [ generationVoisinError  , setGenerationVoisinError   ] = useState ( "" );
	const [ nbVehiculeError        , setNbVehiculeError         ] = useState ( "" );

	// Conversion states
	const [ isProcessing, setIsProcessing ] = useState ( false );
	const [ isProcessed , setIsProcessed  ] = useState ( false );

	// Algorithm results
	const [ executionTime  , setExecutionTime   ] = useState ( null    );
	const [ optimalSolution, setOptimalSolution ] = useState ( null    );
	const [ activeTab      , setActiveTab       ] = useState ( "graph" );
	const [ vehicleColors  , setVehicleColors   ] = useState ( []      );

	// Graph data references
	const graphDataRef = useRef(null);
	const [graphData, setGraphData] = useState(null);
	const [graphGenerated, setGraphGenerated] = useState(false);

	const isFormValid = ( ) => {
		let hasError = false;

		if (!file) {
			setFileError("Veuillez sélectionner un fichier.");
			hasError = true;
		} else {
			setFileError("");
		}

		if (!nbIteration || isNaN(nbIteration) || parseInt(nbIteration) <= 0) {
			setNbIterationError("Veuillez entrer un nombre valide pour les itérations.");
			hasError = true;
		} else {
			setNbIterationError("");
		}

		if (!refroidissement || isNaN(refroidissement) || parseFloat(refroidissement) <= 0) {
			setRefroidissementError("Veuillez entrer un nombre valide pour le refroidissement.");
			hasError = true;
		} else {
			setRefroidissementError("");
		}

		if (!nbSolutionInitiale || isNaN(nbSolutionInitiale) || parseInt(nbSolutionInitiale) <= 0) {
			setNbSolutionInitialeError("Veuillez entrer un nombre valide pour les solutions initiales.");
			hasError = true;
		} else {
			setNbSolutionInitialeError("");
		}

		if (!temperature || isNaN(temperature) || parseInt(temperature) <= 0) {
			setTemperatureError("Veuillez entrer un nombre valide pour la température.");
			hasError = true;
		} else {
			setTemperatureError("");
		}

		if (!generationVoisin || isNaN(generationVoisin) || parseInt(generationVoisin) <= 0) {
			setGenerationVoisinError("Veuillez entrer un nombre valide pour la génération de voisins.");
			hasError = true;
		} else {
			setGenerationVoisinError("");
		}

		if (!nbVehicule || isNaN(nbVehicule) || parseInt(nbVehicule) <= 0) {
			setNbVehiculeError("Veuillez entrer un nombre valide pour le nombre de véhicules.");
			hasError = true;
		} else {
			setNbVehiculeError("");
		}

		return !hasError;
	};

	const handleFileChange = (event) => {
		setFile(event.target.files[0]);
		setFileError("");
	};

	const handleInputChange = (setter, errorSetter) => (event) => {
		const value = event.target.value;
		setter(value);
		errorSetter("");
	};

	const generateVehicleColors = (count) => {
		const colors = [];
		for (let i = 0; i < count; i++) {
			colors.push(`hsl(${(i * 137.508) % 360}, 70%, 50%)`);
		}
		return colors;
	};

	const handleProcess = async () => {
		if (!isFormValid()) return;

		setIsProcessing(true);

		await new Promise(resolve => setTimeout(resolve, 100));

		try {
			// Algorithm execution
			const fileContent = await file.text();
			const resultat = await runSimulatedAnnealing(
				parseInt(nbIteration),
				parseFloat(refroidissement),
				parseInt(nbSolutionInitiale),
				parseInt(temperature),
				parseInt(nbVehicule),
				convertor(fileContent, nbVehicule)
			);

			graphDataRef.current = resultat;
			setGraphData(resultat);

			setExecutionTime(resultat.tempsExecution);
			setOptimalSolution(resultat.cout);
			setIsProcessed(true);
			setGraphGenerated(true);

			const colors = generateVehicleColors(parseInt(nbVehicule));
			setVehicleColors(colors);

		} catch (error) {
			alert("Une erreur est survenue lors du traitement : " + error.message );
		} finally {
			setIsProcessing(false);
		}
	};

	useEffect(() => {
		if (graphDataRef.current) {
			setGraphData(graphDataRef.current);
		}
	}, []);

	return (
		<div className="h-screen w-screen flex items-center justify-center">
			<motion.div
				initial={{ opacity: 0, scale: 0.8 }}
				animate={{ opacity: 1, scale: 1 }}
				exit={{ opacity: 0, scale: 0.8 }}
				transition={{ duration: 0.5 }}
				className="bg-white shadow-2xl rounded-2xl overflow-hidden w-[48rem]"
			>
				{/* Title bar */}
				<div className="bg-[var(--primary-color)] text-white flex justify-between items-center px-4 py-2">
					<span className="font-semibold">Algorithme de Recuit Simulé</span>
					<Link to="/">
						<X className="cursor-pointer hover:text-gray-200" />
					</Link>
				</div>

				{/* Content */}
				<div className="p-6 flex flex-col gap-4">
					{(() => {
						if (!isProcessing && !isProcessed) {
							return (
								<div className="flex flex-col gap-4">
									{/* Form and launch button */}
									<div className="grid grid-cols-2 gap-4">
										{/* File input */}
										<div className="flex flex-col col-span-2">
											<label htmlFor="fileInput" className="text-gray-700 font-medium">Sélectionnez un fichier (.txt) :</label>
											<input
												id="fileInput"
												type="file"
												accept=".txt"
												onChange={handleFileChange}
												className={`border p-2 rounded-md focus:border-[var(--primary-color)] ${fileError ? "border-red-500" : ""}`} />
											{fileError && <p className="text-red-500 text-sm mb-1">{fileError}</p>}
										</div>

										{/* Parameter fields */}
										<InputField
											id="nbIterationInput"
											type="number"
											value={nbIteration}
											onChange={handleInputChange(setNbIteration, setNbIterationError)}
											error={nbIterationError}
											label="Nombre d'itérations"
											placeholder="Entrez le nombre d'itérations"
											min="1"
											step="1" />

										<InputField
											id="refroidissementInput"
											type="number"
											value={refroidissement}
											onChange={handleInputChange(setRefroidissement, setRefroidissementError)}
											error={refroidissementError}
											label="Refroidissement"
											placeholder="Entrez le refroidissement"
											step="0.001" />

										<InputField
											id="nbSolutionInitialeInput"
											type="number"
											value={nbSolutionInitiale}
											onChange={handleInputChange(setNbSolutionInitiale, setNbSolutionInitialeError)}
											error={nbSolutionInitialeError}
											label="Nombre de solutions initiales"
											placeholder="Entrez le nombre de solutions initiales"
											min="1"
											step="1" />

										<InputField
											id="temperatureInput"
											type="number"
											value={temperature}
											onChange={handleInputChange(setTemperature, setTemperatureError)}
											error={temperatureError}
											label="Température"
											placeholder="Entrez la température"
											min="1"
											step="1" />
											
										<InputField
											id="generationVoisinInput"
											type="number"
											value={generationVoisin}
											onChange={handleInputChange(setGenerationVoisin, setGenerationVoisinError)}
											error={generationVoisinError}
											label="Génération de voisins"
											placeholder="Entrez la génération de voisins"
											min="1"
											step="1" />

										<InputField
											id="nbVehiculeInput"
											type="number"
											value={nbVehicule}
											onChange={handleInputChange(setNbVehicule, setNbVehiculeError)}
											error={nbVehiculeError}
											label="Nombre de véhicules"
											placeholder="Entrez le nombre de véhicules"
											min="1"
											step="1" />
									</div>
									<TabButton
										onClick={handleProcess}
										isActive={false}
									>
										Lancer l'algorithme
									</TabButton>
								</div>
							);
						} else if (isProcessing) {
							return <Spinner />
						} else {
							return (
								<div className="flex flex-col gap-4">
									{/* Tabs */}
									<div className="flex space-x-4">
										<TabButton
											onClick={() => setActiveTab('graph')}
											isActive={activeTab === 'graph'}
										>
											Vue : Graphe
										</TabButton>
										<TabButton
											onClick={() => setActiveTab('list')}
											isActive={activeTab === 'list'}
										>
											Vue : Liste
										</TabButton>
									</div>

									{/* Tab content */}
									{activeTab === "graph" && graphGenerated && (
										<div>
											<GraphVisualization resultat={graphData} colors={vehicleColors}/>
										</div>
									)}
									{activeTab === "list" && (
										<div>
											{/* Vehicle Selection */}
											<div className="flex justify-center mb-4">
												<select
													id="vehicleSelect"
													className="border p-2 rounded-md focus:border-[var(--primary-color)]"
													value={vehicleSelection}
													onChange={(e) => setVehicleSelection(parseInt(e.target.value))}
												>
													{Array.from({ length: nbVehicule }, (_, i) => i).map((index) => (
														<option key={index} value={index}>Véhicule {index + 1}</option>
													))}
												</select>
											</div>

											{/* Vehicle Data */}
											{graphData?.solution ? (
												<div className="mb-4 flex justify-around">
													<div className="text-gray-700">
														Charge du véhicule : {
															graphData.solution[vehicleSelection].reduce((sum, cantine) => sum + graphData.demandeCantine[cantine-1], 0)
														} kg
													</div>
													<div className="text-gray-700">
														Nombre de sites visités : {graphData.solution[vehicleSelection].length}
													</div>
												</div>
											) : (
												<div className="mb-4 text-center text-gray-700">Aucune donnée de véhicule disponible.</div>
											)}

											{/* Vehicle Graph Visualization */}
											<GraphVisualization
												resultat={graphData}
												colors={vehicleColors}
												vehicleSelection={vehicleSelection}
											/>
											
										</div>
									)}

									{/* Additional Information */}
									<div className="flex justify-around gap-2">
										<p className="text-gray-700 font-medium">Temps d'exécution : {executionTime.toFixed(3)} s</p>
										<p className="text-gray-700 font-medium">Solution optimale : {optimalSolution.toFixed(3)}</p>
									</div>
								</div>
							);
						}
					})()}
				</div>
			</motion.div>
		</div>
	);
};

export default AnnealingPage;
