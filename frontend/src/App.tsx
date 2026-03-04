import React, { useState } from "react";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";

function App() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div>
      {showLogin ? <LoginForm /> : <RegisterForm />}
      <div className="text-center mt-4">
        <button
          className="text-blue-500 underline"
          onClick={() => setShowLogin(!showLogin)}
        >
          {showLogin ? "Create an account" : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
}

export default App;