import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import DataPage from "./pages/DataPage.jsx";
import KnowledgePage from "./pages/KnowledgePage.jsx";
import ProblemDetail from "./pages/ProblemDetail.jsx";
import ProblemListPage from "./pages/ProblemListPage.jsx";
import ReviewPage from "./pages/ReviewPage.jsx";
import RoutePage from "./pages/RoutePage.jsx";
import StatsPage from "./pages/StatsPage.jsx";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<RoutePage />} />
        <Route path="/route" element={<RoutePage />} />
        <Route path="/knowledge" element={<KnowledgePage />} />
        <Route path="/problems" element={<ProblemListPage />} />
        <Route path="/problem/:id" element={<ProblemDetail />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/data" element={<DataPage />} />
      </Routes>
    </Layout>
  );
}
