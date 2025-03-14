import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network';

function generateNode(id, label, color) {
	return {
		id,
		label,
		color: {
			border: 'transparent',
			background: color,
			highlight: {
				border: 'transparent',
				background: color,
			},
		},
		shadow: {
			enabled: true,
			color: 'rgba(0,0,0,0.5)',
			size: 10,
			x: 2,
			y: 2,
		},
	};
}

// Méthode pour générer une arête
function generateEdge(from, to, color, distance, arrow = true) {
	const edge = {
		from,
		to,
		color,
		label: `${distance} km`
	};

	if (arrow) {
		edge.arrows = {
			to: {
				enabled: true,
				scaleFactor: 0.5,
				type: 'triangle',
				color: 'black',
			},
		};
	}

	return edge;
}

function generateNodes(points) {
	return points.map(point => generateNode(point.id, point.label, point.color));
}

function generateEdges(routes) {
	return routes.map(route => generateEdge(route.from, route.to, route.color, route.distance));
}

const convertirResultat = (resultat, colors, vehicleSelection = null) => {
	const points = [{ id: 'depot', type: 'depot', color: '#000000', label: 'Depot' }];
	const routes = [];
	
	const processTournee = (tournee, vehicleIndex) => {
		const circuitColor = colors[vehicleIndex % colors.length];
		
		tournee.forEach((point, pointIndex) => {
			if (point !== 0) {
				const pointId = `point${point}`;
				let label = `Cantine ${point}`;
				
				if (vehicleSelection !== null) {
					const demande = resultat.demandeCantine[point];
					label += ` [${demande}kg]`;
				}
				
				points.push({
					id: pointId,
					label: label,
					color: circuitColor
				});

				const fromId = pointIndex === 0 ? 'depot' : `point${tournee[pointIndex - 1]}`;
				routes.push({
					from: fromId,
					to: pointId,
					color: circuitColor,
					distance: resultat.distances[
						fromId === 'depot' ? 0 : parseInt(fromId.slice(5))
					][point]
				});
			}
		});

		const lastPoint = tournee[tournee.length - 1];
		if (lastPoint !== 0) {
			routes.push({
				from: `point${lastPoint}`,
				to: 'depot',
				color: circuitColor,
				distance: resultat.distances[lastPoint][0]
			});
		}
	};

	if (vehicleSelection !== null) {
		// Mode véhicule unique
		processTournee(resultat.solution[vehicleSelection], vehicleSelection);
	} else {
		// Mode tous les véhicules
		resultat.solution.forEach((tournee, index) => processTournee(tournee, index));
	}

	return { points, routes };
};



const GraphVisualization = ({ resultat, colors, vehicleSelection }) => {
	const graphRef = useRef(null);

	useEffect(() => {
		if (!graphRef.current || !resultat || !colors) return;

		const conversion = vehicleSelection !== undefined ?
			convertirResultat(resultat, colors, vehicleSelection) :
			convertirResultat(resultat, colors);

		const { points, routes } = conversion;
		const nodes = generateNodes(points);
		const edges = generateEdges(routes);

		const networkOptions = {
			nodes: {
				shape: 'dot',
				size: 20,
				borderWidth: 2,
				font: {
					face: 'Arial',
					size: 14,
					strokeWidth: 2
				},
				scaling: {
					min: 10,
					max: 30
				}
			},
			edges: {
				width: 2,
				smooth: false,
				arrows: 'to'
			},
			physics: {
				enabled: true,
				solver: 'barnesHut',
				barnesHut: {
					gravitationalConstant: -3000,
					springLength: 200,
					springConstant: 0.04,
					damping: 0.15,
					avoidOverlap: 0.2
				},
				stabilization: {
					enabled: true,
					iterations: 2000,
					updateInterval: 50,
					fit: true
				}
			}
		};

		// Création de l'instance réseau
		const network = new Network(graphRef.current, { nodes, edges }, networkOptions);

		// Nettoyage
		return () => network.destroy();
	}, [resultat, colors, vehicleSelection]); // Dépendances réactives

	return <div ref={graphRef} className="w-full h-[36rem]" />;
};


export default GraphVisualization;
