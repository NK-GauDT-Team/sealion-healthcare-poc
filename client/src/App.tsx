import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Demo from "@/pages/demo";
import Journey from "@/pages/journey";
import NotFound from "@/pages/not-found";

// // App.tsx
// import { Switch, Route } from "wouter";
// import Home from "./pages/Home";
// import Demo from "./pages/Demo";
// import Journey from "./pages/Journey";
// import NotFound from "./pages/NotFound";
function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/demo" component={Demo} />
      <Route path="/journey" component={Journey} />
      <Route component={NotFound} />
    </Switch>
  );
}
// function Router() {
//   return (
//     <Switch>
//       <Route path="/" component={Home} />
//       <Route path="/demo" component={Demo} />
//       <Route path="/journey" component={Journey} />
//       <Route component={NotFound} />
//     </Switch>
//   );
// }

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppRouter />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
