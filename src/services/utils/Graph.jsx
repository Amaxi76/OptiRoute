class GraphUtils {
	// Méthode pour générer un nœud
	static generateNode(id, label, color) {
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
	static generateEdge(from, to, color, distance, arrow = true) {
		const edge = {
			from,
			to,
			color,
			label: `${distance} km`, // Afficher la distance sur l'arête
			title: `Distance: ${distance} km`, // Pour l'info au survol
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

	// Méthode pour générer un ensemble de nœuds
	static generateNodes(points) {
		return points.map(point => GraphUtils.generateNode(point.id, point.label, point.color));
	}

	// Méthode pour générer un ensemble d'arêtes
	static generateEdges(routes) {
		return routes.map(route => GraphUtils.generateEdge(route.from, route.to, route.color, route.distance));
	}
}

export default GraphUtils;
