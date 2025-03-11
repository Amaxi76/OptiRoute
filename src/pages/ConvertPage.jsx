import React, { useState } from "react";
import { Link            } from "react-router-dom";
import { motion          } from "framer-motion";
import { X, CheckCircle  } from "lucide-react";
import convertor from "../services/Convertor";
import Spinner from "../components/Spinner";

const ConvertPage = ( ) => {

	// Variables du formulaire
	const [ file        , setFile         ] = useState ( null       );
	const [ vehicleCount, setVehicleCount ] = useState ( ""         );
	const [ fileName    , setFileName     ] = useState ("output.dat");

	// États de conversion
	const [ isConverting, setIsConverting ] = useState ( false );
	const [ isConverted , setIsConverted  ] = useState ( false );

	// Gestion des erreurs
	const [ fileError        , setFileError         ] = useState ( "" );
	const [ vehicleCountError, setVehicleCountError ] = useState ( "" );
	const [ fileNameError    , setFileNameError     ] = useState ( "" );

	// Lien de téléchargement
	const [ downloadLink, setDownloadLink ] = useState ("");

	const handleFileChange = (event) => {
		setFile(event.target.files[0]);
		setFileError("");
	};

	const handleVehicleCountChange = (event) => {
		const value = event.target.value;

		if (/^\d*$/.test(value)) {
		setVehicleCount(value);
		setVehicleCountError("");
		}
	};

	const handleFileNameChange = (event) => {
		const value = event.target.value;
		setFileName(value);
	};

	const handleConvert = async () => {
		let hasError = false;

		if (!file) {
		setFileError("Veuillez sélectionner un fichier.");
		hasError = true;
		} else {
		setFileError("");
		}

		if (!vehicleCount || isNaN(vehicleCount) || parseInt(vehicleCount) <= 0) {
		setVehicleCountError("Veuillez entrer un nombre valide pour le nombre de véhicule.");
		hasError = true;
		} else {
		setVehicleCountError("");
		}

		if (!fileName) {
			setFileNameError("Veuillez entrer un nom de fichier.");
			hasError = true;
		} else if (!fileName.endsWith(".dat")) {
			setFileNameError("Le nom du fichier doit se terminer par .dat.");
			hasError = true;
		} else {
			setFileNameError("");
		}

		if (hasError) return;

		setIsConverting(true);

		try {
		const fileContent = await file.text();
		const outputContent = convertor(fileContent, parseInt(vehicleCount));

		// Créer un fichier Blob pour téléchargement
		const blob = new Blob([outputContent], { type: "text/plain" });
		const url = URL.createObjectURL(blob);

		setDownloadLink(url);
		setIsConverted(true);

		// Déclencher le téléchargement automatique
		const a = document.createElement("a");
		a.href = url;
		a.download = fileName;
		a.click();
		} catch (error) {
		console.error("Erreur lors de la conversion:", error);
		alert("Une erreur est survenue lors de la conversion."); // Pour l'instant, gardez l'alerte pour les erreurs inattendues
		} finally {
		setIsConverting(false);
		}
	};

return (
	<div className="h-screen w-screen flex items-center justify-center">
		<motion.div
			initial={{ opacity: 0, scale: 0.8 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.8 }}
			transition={{ duration: 0.5 }}
			className="bg-white shadow-2xl rounded-2xl overflow-hidden w-[28rem</div>]"
		>
			{/* Barre de titre */}
			<div className="bg-[var(--primary-color)] text-white flex justify-between items-center px-4 py-2">
				<span className="font-semibold">Convertisseur .Dat</span>
				<Link to="/">
					<X className="cursor-pointer hover:text-gray-200" />
				</Link>
			</div>

			{/* Contenu */}
			<div className="p-6 flex flex-col gap-4">
				{(() => {
					if (!isConverting && !isConverted) {
						return (
							<>
								<label htmlFor="fileInput" className="text-gray-700 font-medium">Sélectionnez un fichier (.txt) :</label>
								<input 
									id="fileInput" 
									type="file" 
									accept=".txt"
									onChange={handleFileChange} 
									className={`border p-2 rounded-md focus:border-[var(--primary-color)] ${fileError ? "border-red-500" : ""}`} 
								/>
								{fileError && <p className="text-red-500 text-sm mb-1">{fileError}</p>}

								<label htmlFor="vehicleCountInput" className="text-gray-700 font-medium">Nombre de véhicules :</label>
								<input 
									id="vehicleCountInput"
									type="number"
									value={vehicleCount}
									onChange={handleVehicleCountChange}
									className={`border p-2 rounded-md focus:border-[var(--primary-color)] ${vehicleCountError ? "border-red-500" : ""}`} 
									placeholder="Entrez le nombre de véhicules"
									min="1"
									step="1"
								/>
								{vehicleCountError && <p className="text-red-500 text-sm mb-1">{vehicleCountError}</p>}

								<label htmlFor="fileNameInput" className="text-gray-700 font-medium">Nom du fichier :</label>
								<input 
									id="fileNameInput"
									type="text" 
									value={fileName} 
									onChange={handleFileNameChange} 
									className={`border p-2 rounded-md focus:border-[var(--primary-color)] ${fileNameError ? "border-red-500" : ""}`} 
									placeholder="Entrez le nom du fichier"
								/>
				{fileNameError && <p className="text-red-500 text-sm mb-1">{fileNameError}</p>}


								<button
									onClick={handleConvert}
									className="bg-[var(--primary-color)] font-bold py-2 px-4 rounded-md mt-4 hover:bg-opacity-90 hover:text-[var(--primary-color)] transition-colors"
								>
									Convertir
								</button>
							</>
						);
					} else if (isConverting) {
						return <Spinner />
					} else {
						return (
							<div className="flex flex-col items-center">
								<CheckCircle className="text-[var(--primary-color)] h-16 w-16" />
								<p className="mt-4 text-gray-700">Conversion terminée !</p>
								<p className="mt-1 text-sm text-gray-500">
									Si le téléchargement ne démarre pas automatiquement,  
									<a href={downloadLink} download={fileName} className="text-[var(--primary-color)] hover:underline">
										cliquez ici
									</a>
								</p>
							</div>
						);
					}
				})()}
			</div>
		</motion.div>
	</div>
);
};

export default ConvertPage;
