import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../lib/auth";

export default function Login() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState<string | null>(null);
  const nav = useNavigate();

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      await login(email, password);
      nav("/");
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else if (typeof e === "string") {
        setError(e);
      } else {
        setError("Login failed");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handle}
        className="bg-white p-8 rounded shadow w-full max-w-md"
      >
        <h2 className="text-2xl mb-4">Entrar</h2>

        {error && <div className="mb-2 text-sm text-red-600">{error}</div>}

        <label className="block mb-2">
          <div className="text-sm mb-1">Email</div>

          <input
            className="w-full border rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="block mb-4">
          <div className="text-sm mb-1">Senha</div>

          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <button className="w-full bg-sky-600 text-white py-2 rounded">
          Entrar
        </button>
      </form>
    </div>
  );
}
