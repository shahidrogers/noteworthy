import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";

import Dashboard from "./pages/Dashboard";
import EditNote from "./pages/EditNote";
import NotFound from "./pages/NotFound";

import "./App.css";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <TooltipProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/note/:id" element={<EditNote />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
