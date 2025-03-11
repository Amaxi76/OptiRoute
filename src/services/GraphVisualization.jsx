import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network';
import { generateNodes, generateEdges } from '../services/utils/Graph';


const convertirResultat = (resultat, colors) => {
    const points = [
        { id: 'depot', type: 'depot', color: '#000000', label: 'Depot' }
    ];

    const routes = [];

    // Convertir la solution en points et routes
    resultat.solution.forEach((tournee, index) => {
        const circuitColor = colors[index % colors.length]; // Utiliser la couleur fournie

        tournee.forEach((point, pointIndex) => {
            if (point !== 0) { // 0 représente généralement le dépôt
                const pointId = `point${point}`;
                points.push({
                    id: pointId,
                    label: `Cantine ${point}`,
                    color: circuitColor // Appliquer la couleur du circuit
                });

                const fromId = pointIndex === 0 ? 'depot' : `point${tournee[pointIndex - 1]}`;
                const toId = pointId;

                routes.push({
                    from: fromId,
                    to: toId,
                    color: circuitColor,
                    distance: resultat.distances[fromId === 'depot' ? 0 : parseInt(fromId.slice(5))][point]
                });
            }
        });

        // Ajouter la route de retour au dépôt
        const dernierPoint = tournee[tournee.length - 1];
        if (dernierPoint !== 0) {
            routes.push({
                from: `point${dernierPoint}`,
                to: 'depot',
                color: circuitColor,
                distance: resultat.distances[dernierPoint][0]
            });
        }
    });

    return { points, routes };
};


const GraphVisualization = ({ resultat, colors }) => { // Correction : destructuration de `resultat`
    const graphRef = useRef(null);

    useEffect(() => {
        if (!graphRef.current) return;

        const { points, routes } = convertirResultat(resultat, colors);

        const nodes = generateNodes(points);
        const edges = generateEdges(routes);

        const options = {
            nodes: {
                shape: 'dot',
                size: 15,
                fixed: false,
            },
            edges: {
                width: 2,
                smooth: {
                    type: 'cubicBezier',
                    forceDirection: 'none',
                    roundness: 0.4,
                },
                font: {
                    face: 'Arial',
                    size: 12,
                },
            },
            physics: {
                enabled: true,
                repulsion: {
                    centralGravity: 0.01,
                    springLength: 200,
                    springConstant: 0.05,
                    nodeDistance: 150,
                    damping: 0.09,
                },
                solver: 'repulsion',
                stabilization: {
                    enabled: true,
                    iterations: 1000,
                    updateInterval: 25,
                },
            },
            interaction: {
                dragNodes: false,
                zoomView: true,
                dragView: true,
            },
        };

        new Network(graphRef.current, { nodes, edges }, options);
    }, [resultat, colors]);

    return (
        <div ref={graphRef} className="w-full h-[40rem]" />
    );
};

export default GraphVisualization;
