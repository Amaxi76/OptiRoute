import React          from "react";
import { Link }       from "react-router-dom";
import { FaRoute }    from "react-icons/fa";
import { FaFileCode } from "react-icons/fa6";

const HomePage = () => {
	return (
		<div className="w-dvw flex flex-col items-center justify-between min-h-screen text-white p-6">
			{/* Logo centré */}
			<div className="flex-grow flex flex-col items-center justify-center drop-shadow-xl">
				<img
					src="/src/assets/logo.svg"
					alt="Logo"
					className="w-56 "
				/>
				<h1 className="mt-4 text-3xl font-bold text-[var(--primary-color)]">OptiRoute</h1>
			</div>

			{/* Cartes en bas */}
			<div className="flex justify-around w-full max-w-2xl pb-20 gap-6 text-[var(--primary-color)]">
				<Link
					to="/convert"
					className="flex flex-col items-center  rounded-lg shadow-lg w-64  hover:shadow-xl transition-transform transform hover:scale-105 hover:shadow-[var(--primary-color)]/50"
				>
					<div className="flex items-center justify-center w-full h-32 bg-[var(--primary-color)] rounded-t-lg">
						<FaFileCode className="w-20 h-20 text-white"/>
					</div>
					<h5 className="mt-4 mb-4 text-lg font-semibold">Convertisseur .dat</h5>
				</Link>
				<Link
					to="/annealing"
					className="flex flex-col items-center rounded-lg shadow-lg w-64 hover:shadow-xl transition-transform transform hover:scale-105 hover:shadow-[var(--primary-color)]/50"
				>
					<div className="flex items-center justify-center w-full h-32 bg-[var(--primary-color)] rounded-t-lg">
						<FaRoute className="w-20 h-20 text-white" />
					</div>
					<h5 className="mt-4 mb-4 text-lg font-semibold">Utiliser le recuit simulé</h5>
				</Link>
			</div>
		</div>
	);
};

export default HomePage;
