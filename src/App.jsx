import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import auth from "./pages/Auth.jsx";
import { supabase } from "./supabase.js"
import home from "./pages/home.jsx"

export default function App() {
  return (
   <Routes>
          <Route path="/" element={
           
              <Home />
           
          } />

          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/register" element={<Auth mode="register" />} />
      </Routes>
  );
}
