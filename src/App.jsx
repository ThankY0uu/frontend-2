import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import auth from "./pages/Auth.jsx";
import client from "../supabase.js"
import PrivateRoute from './components/PrivateRoute';
import home from "./pages/home.jsx"

export default function App() {
  return (
      <Routes>
          {/* De homepage is beschermd – alleen zichtbaar voor ingelogde gebruikers */}
          <Route path="/" element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          } />


          {/* Inlogpagina – toegankelijk voor iedereen */}
          <Route path="/login" element={<Auth mode="login" />} />


          {/* Registratiepagina – toegankelijk voor iedereen */}
          <Route path="/register" element={<Auth mode="register" />} />
      </Routes>
  );
}
