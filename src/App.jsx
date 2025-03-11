import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage      from "./HomePage";
import ConvertPage   from "./pages/ConvertPage";
import AnnealingPage from "./pages/AnnealingPage";

const App = () => {
	return (
		<Router>
			<Routes>
				<Route path="/"          element={<HomePage />} />
				<Route path="/convert"   element={<ConvertPage />} />
				<Route path="/annealing" element={<AnnealingPage />} />
			</Routes>
		</Router>
	);
};

export default App;
